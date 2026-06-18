export const isValidDate = (date: string): boolean => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date)) return false;
    const [day, month, year] = date.split('/').map(Number);
    if (month < 1 || month > 12) return false;
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > lastDayOfMonth) return false;
    return true;
};

export const isNextDateAfterCurrent = (current: string, next: string): boolean => {
    const [d1, m1, y1] = current.split('/').map(Number);
    const [d2, m2, y2] = next.split('/').map(Number);
    const date1 = new Date(y1, m1 - 1, d1);
    const date2 = new Date(y2, m2 - 1, d2);
    return date2 > date1;
};

export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isNotEmpty = (value: string | null | undefined): boolean => {
    return !!value && value.trim().length > 0;
};
