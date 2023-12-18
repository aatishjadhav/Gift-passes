import React from 'react';
import { useForm } from 'react-hook-form';
import './App.css'; // Make sure to include your CSS file


function App() {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const onSubmit = async (data) => {
    // Perform any necessary validation before making the API call

    // You can access form data from the "data" object
    console.log(data);

    // You can access individual form fields like this:
    console.log(data.email);

    // Perform API call or other actions as needed
    const response = await fetch('http://localhost:9000/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,  // Make sure to include the 'email' field
        balance: data.balance,
        expiryDate: data.expiryDate,
        termsAndConditions: data.termsAndConditions,
      }),
    });
    const saveUrl = await response.text();

  // Dynamically create anchor tag and inject script
  const anchor = document.createElement('a');
  anchor.href = saveUrl;
  anchor.innerHTML = '<img src="./wallet-button.png" style="width: 150px; height: auto; margin-bottom: 20px;">';

  // Append the anchor to the button div
  document.getElementById('button').appendChild(anchor);
  };

  const email = watch('email', '');
  const balance = watch('balance', '');
  const expiryDate = watch('expiryDate', '');
  const termsAndConditions = watch('termsAndConditions', '');

  return (
    <div id="container">
      <div id="content">
        <h2>Enter your details to generate a new gift card:</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label htmlFor="email">Email:</label>
          <input
            {...register('email', { required: true })}
            type="email"
            id="email"
            placeholder="Email"
          />
          {errors.email && <p>Email is required</p>}

          <label htmlFor="balance">Balance:</label>
          <input
            {...register('balance', { required: true })}
            type="text"
            id="balance"
            placeholder="Enter balance"
          />
          {errors.balance && <p>Balance is required</p>}

          <label htmlFor="expiryDate">Expiry Date:</label>
          <input
            {...register('expiryDate', { required: true })}
            type="text"
            id="expiryDate"
            placeholder="Enter expiry date"
          />
          {errors.expiryDate && <p>Expiry Date is required</p>}

          <label htmlFor="termsAndConditions">Terms and Conditions:</label>
          <textarea
            {...register('termsAndConditions', { required: true })}
            id="termsAndConditions"
            placeholder="Enter terms and conditions"
          ></textarea>
          {errors.termsAndConditions && <p>Terms and Conditions are required</p>}

          <input type="submit" value="Create gift card" id="submit" />
          <div
            id="button"
            dangerouslySetInnerHTML={{
              __html: '<p></p>',
            }}
          ></div>
        </form>
      </div>
      <img id="pass" src="./sample-pass.png" alt="Gift Card Image" />
    </div>
  );
}

export default App;

