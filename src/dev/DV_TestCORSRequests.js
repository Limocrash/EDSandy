// Test function for doGet
function testDoGet() {
    const testEvent = {
      parameter: {
        action: 'getCategories', // Simulate a GET request with action
      },
    };
  
    const response = doGet(testEvent);
    console.log('doGet Response:', response.getContent());
  }
  
  // Test function for doPost
  function testDoPost() {
    const testEvent = {
      postData: {
        contents: JSON.stringify({
          action: 'addExpense', // Simulate a POST request with action
          amount: 100,
          category: 'Household & Food',
          subCategory: 'Supermarket Groceries',
          description: 'Test expense',
          beneficiary: 'Dad',
          paymentMethod: 'Cash – Dad',
        }),
      },
    };
  
    const response = doPost(testEvent);
    console.log('doPost Response:', response.getContent());
  }
  
  // Test function for doOptions
  function testDoOptions() {
    const testEvent = {}; // OPTIONS requests typically don't have data
    const response = doOptions(testEvent);
    console.log('doOptions Response:', response.getContent());
  }