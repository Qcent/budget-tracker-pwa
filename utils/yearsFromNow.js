module.exports = (years) => {
    const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();
    return new Date(year + years, month, day);
}