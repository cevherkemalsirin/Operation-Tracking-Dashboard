import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import SitePinPopup from './SitePinPopup';
import { getSitePinTone } from '../utils/siteUtils';

const EUROPE_CENTER = [50.5, 10.5];

function getPinColor(tone) {
  if (tone === 'danger') return '#ef4444';
  if (tone === 'warning') return '#facc15';
  return '#22c55e';
}

function createSiteIcon(tone) {
  const color = getPinColor(tone);

  return L.divIcon({
    className: '',
    html: `<span class="site-map-pin site-map-pin-${tone}" style="--site-pin-color:${color}"></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

function isValidSite(site) {
  return Number.isFinite(Number(site?.latitude)) && Number.isFinite(Number(site?.longitude));
}

export default function SiteMap({ sites = [], ticket = null, mode = 'full' }) {
  const visibleSites = sites.filter(isValidSite);
  const firstSite = visibleSites[0];
  const center = mode === 'mini' && firstSite
    ? [Number(firstSite.latitude), Number(firstSite.longitude)]
    : EUROPE_CENTER;
  const zoom = mode === 'mini' ? 7 : 4;
  const tileLayer = mode === 'mini'
    ? {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      }
    : {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      };

  if (visibleSites.length === 0) {
    return <div className="site-map-empty">No site location available.</div>;
  }

  return (
    <MapContainer
      className={`site-map site-map-${mode}`}
      center={center}
      zoom={zoom}
      scrollWheelZoom={mode !== 'mini'}
    >
      <TileLayer
        attribution={tileLayer.attribution}
        url={tileLayer.url}
      />
      {visibleSites.map((site) => {
        const tone = getSitePinTone(site, ticket);

        return (
          <Marker
            key={site.siteId}
            position={[Number(site.latitude), Number(site.longitude)]}
            icon={createSiteIcon(tone)}
          >
            <Popup>
              <SitePinPopup site={site} ticket={ticket} tone={tone} />
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
