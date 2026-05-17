/**
 * A simple CSV exporter utility.
 */

// A replacer function for JSON.stringify to handle null values.
function replacer(key: any, value: any) {
    return value === null ? '' : value;
}

/**
 * Converts an array of objects to a CSV string and triggers a download.
 * @param filename - The name of the file to be downloaded (without extension).
 * @param data - An array of objects to be converted to CSV.
 */
export const exportToCsv = (filename: string, data: any[]) => {
    if (data.length === 0) {
        alert("No data available to export.");
        return;
    }

    // Extract headers from the first object's keys.
    const headers = Object.keys(data[0]);

    // Construct CSV rows.
    const csvRows = [
        headers.join(','), // Header row
        ...data.map(row =>
            headers
                .map(header => {
                    // Stringify each value to handle commas, quotes, etc.
                    // The replacer handles null values.
                    return JSON.stringify(row[header], replacer);
                })
                .join(',')
        )
    ];

    // Join rows with newline characters.
    const csvString = csvRows.join('\n');

    // Create a Blob object.
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    // Create a link element to trigger the download.
    const link = document.createElement('a');
    if (link.download !== undefined) { // Check for browser support.
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
