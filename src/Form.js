// import { json } from "body-parser";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Form.css";
import Navbar from "./Navbar";

const Form = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  // const [allids,setAllids]=useState(null);
  const [entries, setEntries] = useState([]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const jsonObject = {
    identification_number: "",
    name: "",
    last_name: "",
    date_of_birth: "",
    date_of_issue: "",
    date_of_expiry: "",
  };

  const handleUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append("image", selectedFile);

      try {
        console.log(process.env.NODE_ENV);
        const apiUrl =
          process.env.NODE_ENV === "production"
            ? process.env.REACT_APP_API_URL_PROD_upload
            : process.env.REACT_APP_API_URL_upload;
            console.log(process.env)
        console.log(apiUrl);
        const response = await fetch(apiUrl, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();

          const text = result.text;
          // Extract identification number
          var idNumberRegex = /\b(\d{1,3}\s\d{4}\s\d{5}\s\d{2}\s\d)\b/;
          var idNumberMatch = text.match(idNumberRegex);
          var identificationNumber = idNumberMatch ? idNumberMatch[1] : null;

          // Extract first name and last name
          var nameRegexmiss = /Name (Miss \w+)\nLast name (\w+)/;
          var nameRegexmr = /Name (Mr \w+)\nLast name (\w+)/;

          var nameMatch = nameRegexmiss
            ? text.match(nameRegexmiss)
            : text.match(nameRegexmr);
          var firstName = nameMatch ? nameMatch[1] : null;
          var lastName = nameMatch ? nameMatch[2] : null;
          var fullName =
            firstName && lastName ? `${firstName} ${lastName}` : null;

          // Extract date of birth
          var dobRegex = /Date of Birth (\d+\s\w+\.\s\d{4})/;
          var dobMatch = text.match(dobRegex);
          var dateOfBirth = dobMatch ? dobMatch[1] : null;

          // Extract date of issue
          var issueDateRegex = /วันออกบัตร\n([\d\w\s.:]+)/;
          var issueDateMatch = text.match(issueDateRegex);
          var dateOfIssue = issueDateMatch
            ? issueDateMatch[1].split("\n")[0].trim()
            : null;

          // Extract date of expiry
          var expiryDateRegex = /วันบัตรหมดอายุ[\n\s]*([\d\s\w.:]+)/;
          var expiryDateMatch = text.match(expiryDateRegex);
          var dateOfExpiry = null;

          if (expiryDateMatch) {
            var potentialDate = expiryDateMatch[1].replace(/\s+/g, " ").trim();
            var potentialDateMatch = potentialDate.match(
              /(\d{1,2}\s\w{3}\.\s\d{4})/
            );
            if (potentialDateMatch) {
              dateOfExpiry = potentialDateMatch[1];
            }
          }

          jsonObject.identification_number = identificationNumber;
          jsonObject.name = firstName;
          jsonObject.last_name = lastName;
          jsonObject.date_of_birth = dateOfBirth;
          jsonObject.date_of_issue = dateOfIssue;
          jsonObject.date_of_expiry = dateOfExpiry;

          // console.log(jsonObject);

          setResult(jsonObject);
        } else {
          console.error("Failed to upload file");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      alert("Please Select a file first");
      console.log("no file selected");
    }
  };

  const handleAdd = async () => {
    const apiUrl =
      process.env.NODE_ENV === "production"
        ? process.env.REACT_APP_API_URL_PROD_add
        : process.env.REACT_APP_API_URL_add;
    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result),
    }).then(() => {
      alert("Added");
      handleAllId();
    });

    // alert("Succesfully Added");
    // const result2 = await response.json();

    // handleAllId();
  };

  const handleAllId = async () => {
    const apiUrl =
      process.env.NODE_ENV === "production"
        ? process.env.REACT_APP_API_URL_PROD_allid
        : process.env.REACT_APP_API_URL_allid;
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => setEntries(data))
      .catch((error) => console.error("Error fetching entries:", error));
  };

  const handleDeleteEntry = async (entryId) => {
    // Delete entry with the given ID
    // console.log("api start");
    const apiUrl =
      process.env.NODE_ENV === "production"
        ? process.env.REACT_APP_API_URL_PROD_delete
        : process.env.REACT_APP_API_URL_delete;
    fetch(`${apiUrl}${entryId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data.message);
        // Fetch updated entries after deletion
        handleAllId();
        alert("Entry Deleted");
      })
      .catch((error) => console.error("Error deleting entry:", error));
  };

  return (
    <div className="main">
      <Navbar />
      <input className="file-input" type="file" onChange={handleFileChange} />
      <button className="submit-btn" onClick={handleUpload}>
        Upload and Analyze
      </button>
      {result && (
        <div className="result-box">
          <h2>Analysis Result:</h2>
          <pre className="blankarea">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {result && (
        <button className="add-to-db" onClick={handleAdd}>
          ADD to DB
        </button>
      )}
      <button className="all-button" onClick={handleAllId}>
        Check All Ids
      </button>

      <ul>
        {entries.map((entry) => (
          <li key={entry.identification_number}>
            {entry.identification_number} - {entry.name} {entry.last_name}
            <button
              className="entry-list"
              onClick={() => handleDeleteEntry(entry.identification_number)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Form;
