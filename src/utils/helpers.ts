export const getInitials = (name: string | null | undefined): string => {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'optimal':
    case 'baik':
      return 'success';
    case 'cukup':
      return 'warning';
    case 'perlu pembinaan':
      return 'danger';
    default:
      return 'primary';
  }
};
