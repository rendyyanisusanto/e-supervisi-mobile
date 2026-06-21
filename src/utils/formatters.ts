export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  const d = new Date(date);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(d);
};

export const formatScore = (score: number | null | undefined): string => {
  if (score === null || score === undefined) return '-';
  return score.toFixed(1);
};
