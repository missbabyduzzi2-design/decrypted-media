
// Core mathematical logic for deep number analysis

export interface NumberMathData {
    basic: {
        divisors: number[];
        sumDivisors: number;
        isPrime: boolean;
        prevPrime: number | null;
        nextPrime: number | null;
        prevTriangular: number | null;
        nextTriangular: number | null;
        prevFibonacci: number | null;
        nextFibonacci: number | null;
        prevPalindrome: number | null;
        nextPalindrome: number | null;
    };
    identity: {
        digitalRoot: number;
        reducedSum: number; // Single digit sum (1-9)
        binary: string;
        octal: string;
        duodecimal: string;
        hex: string;
        isMagicConstant: boolean; // e.g. for 3x3, 4x4 squares
    };
    classification: {
        primeIndex: number | null;
        isTriangular: boolean;
        triangularIndex: number | null;
        isSquare: boolean;
        isCube: boolean;
        isFibonacci: boolean;
        fibonacciIndex: number | null;
        isHarshad: boolean; // Divisible by sum of digits
        isHappy: boolean;
        isPentagonal: boolean;
        isTetrahedral: boolean;
    };
}

// --- Helpers ---

const isPrime = (num: number): boolean => {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
};

const getDivisors = (num: number): number[] => {
    const divisors = [];
    for (let i = 1; i <= Math.sqrt(num); i++) {
        if (num % i === 0) {
            divisors.push(i);
            if (i !== num / i) divisors.push(num / i);
        }
    }
    return divisors.sort((a, b) => a - b);
};

const getDigitalRoot = (num: number): number => {
    return 1 + (num - 1) % 9;
};

const isHappy = (n: number): boolean => {
    const seen = new Set();
    while (n !== 1 && !seen.has(n)) {
        seen.add(n);
        n = String(n).split('').reduce((acc, digit) => acc + Math.pow(parseInt(digit), 2), 0);
    }
    return n === 1;
};

const isHarshad = (n: number): boolean => {
    const sum = String(n).split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    return n % sum === 0;
};

const isPalindrome = (n: number): boolean => {
    const s = String(n);
    return s === s.split('').reverse().join('');
};

// --- Main Analyzer ---

export const analyzeNumberMath = (n: number): NumberMathData => {
    const num = Math.abs(Math.floor(n));
    if (num === 0) throw new Error("Number must be non-zero");

    // 1. Basic
    const divisors = getDivisors(num);
    const sumDivisors = divisors.reduce((a, b) => a + b, 0);
    const primeStatus = isPrime(num);

    // Neighbors
    let prevPrime = null, nextPrime = null;
    for (let i = num - 1; i >= 2; i--) { if (isPrime(i)) { prevPrime = i; break; } }
    let i = num + 1; while(true) { if (isPrime(i)) { nextPrime = i; break; } i++; if (i > num + 1000) break; }

    const isTriangular = (x: number) => Number.isInteger(Math.sqrt(8 * x + 1));
    const isFibonacci = (x: number) => {
        const check1 = 5 * x * x + 4;
        const check2 = 5 * x * x - 4;
        return Number.isInteger(Math.sqrt(check1)) || Number.isInteger(Math.sqrt(check2));
    };

    let prevTri = null, nextTri = null;
    for (let j = num - 1; j > 0; j--) { if (isTriangular(j)) { prevTri = j; break; } }
    let k = num + 1; while(true) { if (isTriangular(k)) { nextTri = k; break; } k++; if (k > num + 1000) break; }

    let prevFib = null, nextFib = null;
    for (let j = num - 1; j > 0; j--) { if (isFibonacci(j)) { prevFib = j; break; } }
    let l = num + 1; while(true) { if (isFibonacci(l)) { nextFib = l; break; } l++; if (l > num + 1000) break; }

    let prevPal = null, nextPal = null;
    for (let j = num - 1; j > 0; j--) { if (isPalindrome(j)) { prevPal = j; break; } }
    let m = num + 1; while(true) { if (isPalindrome(m)) { nextPal = m; break; } m++; if (m > num + 2000) break; }

    // 2. Identity
    const digitalRoot = getDigitalRoot(num);
    
    // Magic Constants check (Is this number a magic constant for order n?)
    // M = n(n^2 + 1)/2. 
    // Check orders 3 to 10
    let isMagic = false;
    for(let order=3; order<=10; order++) {
        if (num === (order * (order*order + 1))/2) isMagic = true;
    }

    // 3. Classification
    let primeIndex = null;
    if (primeStatus) {
        let count = 0;
        for(let p=2; p<=num; p++) { if (isPrime(p)) count++; }
        primeIndex = count;
    }

    let triangularIndex = null;
    if (isTriangular(num)) {
        triangularIndex = (Math.sqrt(8 * num + 1) - 1) / 2;
    }

    const sqrt = Math.sqrt(num);
    const cbrt = Math.cbrt(num);
    
    // Pentagonal: Pn = n(3n-1)/2 -> 3n^2 - n - 2x = 0
    const isPentagonal = (Number.isInteger((1 + Math.sqrt(1 + 24 * num)) / 6));
    
    // Tetrahedral: Tn = n(n+1)(n+2)/6. 
    let isTetrahedral = false;
    let nTetra = 1;
    while(true) {
        const t = (nTetra * (nTetra + 1) * (nTetra + 2)) / 6;
        if (t === num) { isTetrahedral = true; break; }
        if (t > num) break;
        nTetra++;
    }

    let fibIndex = null;
    if (isFibonacci(num)) {
         // Approx index formula usually sufficient for display or iterate
         let a=0, b=1, idx=1;
         if (num === 0) fibIndex = 0;
         else {
             while(b <= num) {
                 if (b === num) { fibIndex = idx; break; }
                 const temp = a + b; a = b; b = temp; idx++;
             }
         }
    }

    return {
        basic: {
            divisors,
            sumDivisors,
            isPrime: primeStatus,
            prevPrime, nextPrime,
            prevTriangular: prevTri, nextTriangular: nextTri,
            prevFibonacci: prevFib, nextFibonacci: nextFib,
            prevPalindrome: prevPal, nextPalindrome: nextPal
        },
        identity: {
            digitalRoot,
            reducedSum: digitalRoot,
            binary: num.toString(2),
            octal: num.toString(8),
            duodecimal: num.toString(12).toUpperCase(),
            hex: num.toString(16).toUpperCase(),
            isMagicConstant: isMagic
        },
        classification: {
            primeIndex,
            isTriangular: triangularIndex !== null,
            triangularIndex,
            isSquare: Number.isInteger(sqrt),
            isCube: Number.isInteger(cbrt),
            isFibonacci: fibIndex !== null,
            fibonacciIndex: fibIndex,
            isHarshad: isHarshad(num),
            isHappy: isHappy(num),
            isPentagonal,
            isTetrahedral
        }
    };
};
