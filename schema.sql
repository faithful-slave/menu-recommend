CREATE TABLE IF NOT EXISTS visits (
  date TEXT NOT NULL,
  ip   TEXT NOT NULL,
  ts   INTEGER,
  UNIQUE(date, ip)
);

CREATE TABLE IF NOT EXISTS likes (
  item_id TEXT NOT NULL,
  ip      TEXT NOT NULL,
  ts      INTEGER,
  UNIQUE(item_id, ip)
);
