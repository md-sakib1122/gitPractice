// Function to display a greeting message
function greet(name) {
    console.log('Hello, ' + name + '!');
}

// Call the greet function with a sample name
greet('Alice');

// Function to calculate the sum of two numbers
function add(a, b) {
    return a + b;
}

// Call the add function and log the result
const result = add(5, 3);
console.log('The sum is: ' + result);

// Function to create a simple countdown
function countdown(seconds) {
    let intervalId = setInterval(() => {
        if (seconds <= 0) {
            clearInterval(intervalId);
            console.log('Countdown finished!');
        } else {
            console.log(seconds);
            seconds--;
        }
    }, 1000);
}

// Start a countdown from 5 seconds
countdown(5);

