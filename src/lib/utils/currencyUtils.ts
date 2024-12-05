export const formatVND = (value: string | number) => {
  const numericValue = Number(value);
  if (isNaN(numericValue)) {
    return '0 ₫';
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(numericValue);
};

export const parseVNDInput = (value: string) => {
  return value.replace(/[^0-9]/g, '');
};
