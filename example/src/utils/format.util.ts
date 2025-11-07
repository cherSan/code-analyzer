export const formatDate = (date: Date): string => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    console.log('Formatting date...');

    return `${day}/${month}/${year}`;
};

export const unusedUtil = () => {
    debugger;
    return 'unused';
};