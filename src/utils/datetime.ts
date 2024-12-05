export const getISODate = () => new Date().toISOString();

export const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const formatTimestampTx = (timestamp: number) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} | ${hours}:${minutes}`;
};

export const formatISODate = (iso: string) => {
  const time = new Date(iso).getTime();
  return Number.isNaN(time) ? iso : formatTimestamp(time);
};

export const getCurrentTimeUTC = () => {
  const now = new Date();
  return now.getTime() + now.getTimezoneOffset() * 60000;
};
