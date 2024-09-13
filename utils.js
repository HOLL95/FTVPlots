function sanitizeFilename(name) {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}
function columnStack(array, index) {
// Find the length of the first array (assumes all arrays are the same length)
const rows = array[0].length;
const col_num=2;
const result = [];

// Iterate over each row index
for (let i = 0; i < rows; i++) {
    const row = [];

    // Collect the ith element from each array
    for (let j=0; j<col_num; j++) {
        row.push(array[index[j]][i]);
    }
    result.push(row);
}

return result;
}
function findClosestIndex(arr, target) {
if (arr.length === 0) {
    return -1; // Return -1 if the array is empty
}

return arr.reduce((closest, current, index) => {
    if (Math.abs(current - target) < Math.abs(arr[closest] - target)) {
        return index;
    } else {
        return closest;
    }
}, 0);
}
function calculateMean(numbers) {
if (numbers.length === 0) {
    return 0; // or you might want to return null or throw an error
}

const sum = numbers.reduce((acc, val) => acc + val, 0);
return sum / numbers.length;
}
function columnStackObject(object, keys) {
// Find the length of the first array (assumes all arrays are the same length)
const rows = object[Object.keys(object)[0]].length;
const col_num=2;
const result = [];

// Iterate over each row index
for (let i = 0; i < rows; i++) {
    const row = [];

    // Collect the ith element from each array
    for (let j=0; j<col_num; j++) {
        row.push(object[keys[j]][i]);
    }
    result.push(row);
}

return result;
}

function mergeSeriesForDygraphs(seriesArray) {
// Step 1: Collect all unique x-values
const xValues = new Set();
seriesArray.forEach(series => {
    series.forEach(point => xValues.add(point[0]));
});

// Step 2: Create a sorted array of unique x-values
const sortedXValues = Array.from(xValues).sort((a, b) => a - b);

// Step 3: Create a map for quick lookup of y-values
const mapped_arrays=seriesArray.map(series => mapFuncCols(series));

// Step 4: Merge the series
const mergedData = sortedXValues.map(x => {
    const row = [x];
    mapped_arrays.forEach(seriesMap => {
        row.push(seriesMap[x] ?? null);
    });
    return row;
});
return mergedData;
}
function mapFuncCols(colstacked_array) {
const result = {};
for (let i = 0; i < colstacked_array.length; i++) {
result[colstacked_array[i][0]] = colstacked_array[i][1];
}

return result;
}
function objectToCSV(obj) {
const headers = Object.keys(obj);
const maxLength = Math.max(...headers.map(header => obj[header].length));

const csvRows = [headers.join(',')];

for (let i = 0; i < maxLength; i++) {
const row = headers.map(header => {
  const value = obj[header][i];
  return value !== undefined ? value : '';
}).join(',');
csvRows.push(row);
}

return csvRows.join('\n');
}