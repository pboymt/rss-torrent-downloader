//7EGHHQRVV6LRVSGDEJT3C2NJ6YKL2FLP
//f90c73c235af971ac8c32267b169a9f614bd156f

export function HashConvert(str) {
    let arr = str.split('');
    let binary = '';
    for (let x in arr) {
        binary += char2bin(arr[x]);
    }
    return bin2hex(binary);
}

export function char2bin(char: string) {
    let num = 0;
    if (Number(char)) {
        num = Number(char) + 24;
    } else {
        num = char.charCodeAt(0) - 65;
    }
    let result = num.toString(2).padStart(5, '0');
    //console.log(result);
    return result;
}

export function bin2hex(bina) {
    let a = bina.match(/[0,1]{4}/g);
    //console.log(a);
    let hex = '';
    for (let x in a) {
        hex += parseInt(a[x], 2).toString(16);
    }
    return hex;
}
