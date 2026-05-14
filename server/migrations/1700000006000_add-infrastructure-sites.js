/**
 * Adds telecom infrastructure sites and links every ticket to one Site ID.
 */

export const up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS infrastructure_sites (
      site_id TEXT PRIMARY KEY,
      country TEXT NOT NULL,
      country_code TEXT NOT NULL,
      city TEXT NOT NULL,
      city_code TEXT NOT NULL,
      latitude NUMERIC(9, 6) NOT NULL,
      longitude NUMERIC(9, 6) NOT NULL,
      infrastructure_type TEXT NOT NULL,
      vendor TEXT NOT NULL DEFAULT 'Nokia',
      status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Maintenance', 'Offline')),
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    INSERT INTO infrastructure_sites (
      site_id, country, country_code, city, city_code, latitude, longitude,
      infrastructure_type, vendor, status, description
    ) VALUES
      ('EU-RO-TM-001','Romania','RO','Timisoara','TM',45.7489,21.2087,'5G Macro Tower','Nokia','Active','Urban macro site covering central Timisoara'),
      ('EU-RO-TM-002','Romania','RO','Timisoara','TM',45.7640,21.2285,'Edge Router Hub','Nokia','Maintenance','Regional transport aggregation point'),
      ('EU-RO-CJ-001','Romania','RO','Cluj','CJ',46.7712,23.6236,'5G Rooftop Antenna','Nokia','Active','Rooftop radio site near Cluj business district'),
      ('EU-RO-CJ-002','Romania','RO','Cluj','CJ',46.7550,23.5890,'Core Switch Site','Nokia','Active','Metro switching equipment location'),
      ('EU-RO-BU-001','Romania','RO','Bucharest','BU',44.4268,26.1025,'5G Macro Tower','Nokia','Active','Capital city macro radio site'),
      ('EU-RO-BU-002','Romania','RO','Bucharest','BU',44.4500,26.0900,'Aggregation Hub','Nokia','Maintenance','High-capacity metro aggregation node'),
      ('EU-RO-BU-003','Romania','RO','Bucharest','BU',44.4100,26.1350,'5G Small Cell Cluster','Nokia','Active','Dense urban small cell deployment'),
      ('EU-DE-BE-001','Germany','DE','Berlin','BE',52.5200,13.4050,'5G Macro Tower','Nokia','Active','Berlin central macro coverage site'),
      ('EU-DE-BE-002','Germany','DE','Berlin','BE',52.5000,13.3500,'Fiber Backhaul Node','Nokia','Active','Backhaul transport node'),
      ('EU-DE-MU-001','Germany','DE','Munich','MU',48.1351,11.5820,'5G Rooftop Antenna','Nokia','Maintenance','Munich business district rooftop site'),
      ('EU-DE-HA-001','Germany','DE','Hamburg','HA',53.5511,9.9937,'Edge Router Hub','Nokia','Active','Northern regional edge hub'),
      ('EU-FR-PA-001','France','FR','Paris','PA',48.8566,2.3522,'5G Macro Tower','Nokia','Active','Paris central radio site'),
      ('EU-FR-PA-002','France','FR','Paris','PA',48.8800,2.3300,'Core Switch Site','Nokia','Active','Paris metro switching site'),
      ('EU-FR-LY-001','France','FR','Lyon','LY',45.7640,4.8357,'5G Rooftop Antenna','Nokia','Maintenance','Lyon rooftop radio site'),
      ('EU-FR-MA-001','France','FR','Marseille','MA',43.2965,5.3698,'Aggregation Hub','Nokia','Active','Mediterranean aggregation location'),
      ('EU-IT-RM-001','Italy','IT','Rome','RM',41.9028,12.4964,'5G Macro Tower','Nokia','Active','Rome central macro site'),
      ('EU-IT-MI-001','Italy','IT','Milan','MI',45.4642,9.1900,'Edge Router Hub','Nokia','Active','Milan edge routing point'),
      ('EU-IT-MI-002','Italy','IT','Milan','MI',45.4800,9.2100,'5G Small Cell Cluster','Nokia','Maintenance','Dense city center small cell cluster'),
      ('EU-IT-NA-001','Italy','IT','Naples','NA',40.8518,14.2681,'Fiber Backhaul Node','Nokia','Active','Naples transport backhaul site'),
      ('EU-ES-MA-001','Spain','ES','Madrid','MA',40.4168,-3.7038,'5G Macro Tower','Nokia','Active','Madrid macro radio site'),
      ('EU-ES-BC-001','Spain','ES','Barcelona','BC',41.3874,2.1686,'5G Rooftop Antenna','Nokia','Maintenance','Barcelona rooftop radio location'),
      ('EU-ES-BC-002','Spain','ES','Barcelona','BC',41.4050,2.1900,'Aggregation Hub','Nokia','Active','Barcelona metro aggregation site'),
      ('EU-ES-VA-001','Spain','ES','Valencia','VA',39.4699,-0.3763,'Edge Router Hub','Nokia','Active','Valencia regional edge site'),
      ('EU-NL-AM-001','Netherlands','NL','Amsterdam','AM',52.3676,4.9041,'Core Switch Site','Nokia','Active','Amsterdam core switching location'),
      ('EU-NL-RT-001','Netherlands','NL','Rotterdam','RT',51.9244,4.4777,'5G Macro Tower','Nokia','Active','Rotterdam macro radio site'),
      ('EU-NL-EH-001','Netherlands','NL','Eindhoven','EH',51.4416,5.4697,'Fiber Backhaul Node','Nokia','Maintenance','Eindhoven backhaul node'),
      ('EU-BE-BR-001','Belgium','BE','Brussels','BR',50.8503,4.3517,'5G Macro Tower','Nokia','Active','Brussels central macro coverage'),
      ('EU-BE-AN-001','Belgium','BE','Antwerp','AN',51.2194,4.4025,'Edge Router Hub','Nokia','Active','Antwerp edge routing site'),
      ('EU-BE-GH-001','Belgium','BE','Ghent','GH',51.0543,3.7174,'5G Rooftop Antenna','Nokia','Maintenance','Ghent rooftop antenna site'),
      ('EU-PL-WA-001','Poland','PL','Warsaw','WA',52.2297,21.0122,'5G Macro Tower','Nokia','Active','Warsaw macro radio site'),
      ('EU-PL-WA-002','Poland','PL','Warsaw','WA',52.2500,21.0300,'Aggregation Hub','Nokia','Active','Warsaw aggregation node'),
      ('EU-PL-KR-001','Poland','PL','Krakow','KR',50.0647,19.9450,'5G Rooftop Antenna','Nokia','Maintenance','Krakow rooftop coverage site'),
      ('EU-PL-GD-001','Poland','PL','Gdansk','GD',54.3520,18.6466,'Fiber Backhaul Node','Nokia','Active','Gdansk backhaul transport site'),
      ('EU-UK-LO-001','United Kingdom','UK','London','LO',51.5072,-0.1276,'5G Macro Tower','Nokia','Active','London macro radio location'),
      ('EU-UK-LO-002','United Kingdom','UK','London','LO',51.5200,-0.1000,'Core Switch Site','Nokia','Active','London core switching site'),
      ('EU-UK-MA-001','United Kingdom','UK','Manchester','MA',53.4808,-2.2426,'Edge Router Hub','Nokia','Maintenance','Manchester edge router site'),
      ('EU-UK-BI-001','United Kingdom','UK','Birmingham','BI',52.4862,-1.8904,'5G Rooftop Antenna','Nokia','Active','Birmingham rooftop radio site')
    ON CONFLICT (site_id) DO NOTHING;

    ALTER TABLE tickets ADD COLUMN IF NOT EXISTS site_id TEXT;

    WITH ordered_tickets AS (
      SELECT id, row_number() OVER (ORDER BY submit_date, id) AS rn
      FROM tickets
      WHERE site_id IS NULL
    ),
    ordered_sites AS (
      SELECT site_id, row_number() OVER (ORDER BY site_id) AS rn, count(*) OVER () AS site_count
      FROM infrastructure_sites
    )
    UPDATE tickets t
    SET site_id = s.site_id
    FROM ordered_tickets ot
    JOIN ordered_sites s ON ((ot.rn - 1) % s.site_count) + 1 = s.rn
    WHERE t.id = ot.id;

    ALTER TABLE tickets ALTER COLUMN site_id SET NOT NULL;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'tickets_site_id_fkey'
      ) THEN
        ALTER TABLE tickets
        ADD CONSTRAINT tickets_site_id_fkey
        FOREIGN KEY (site_id) REFERENCES infrastructure_sites(site_id)
        ON UPDATE CASCADE ON DELETE RESTRICT;
      END IF;
    END $$;
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_site_id_fkey;
    ALTER TABLE tickets DROP COLUMN IF EXISTS site_id;
    DROP TABLE IF EXISTS infrastructure_sites;
  `);
};
