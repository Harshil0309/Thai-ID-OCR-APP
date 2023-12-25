const express = require("express");
const vision = require("@google-cloud/vision");
const multer = require("multer");
const cors = require("cors");
const dbConnection = require("./db");
const Id = require("./models/idModel");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const CREDENTIALS = JSON.parse(
  JSON.stringify({
    type: "service_account",
    project_id: "assignment-409019",
    private_key_id: "db56bca6dd616c97b61e73229843b0485c147566",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDcwteNpz/ra/Ji\nLIHkV8GjHqCLw0AI6vyXK2S08PnqLuL65eFTcmRddxyO7h0v1HvMo/1mHWfeGzD2\nccvh0YgCqHsv+d2De/O7ZRenDrExhI5pHYXzEfA9jf0598htrUmSqKAaiL0IVgd8\nS2AuVgBh0HYx5SCP9iIXbsInGN+Hg55VIuk+P2FwCbwxt3ND1rso/w1WgIsuWx1i\ntUAa+wsx6OkTKICyoJmCWZ5mW3bBNnnj6TlAsHlJtI+YkE5rOOhfDAnoC/9umyLQ\nc88KGlm9ZZN5LLNrcSrVAPTjwp1wnTJ4mdOtA6IirniaWbgnbWPo3pIe0tWnei4M\nTE4FWcvnAgMBAAECggEAJGKCp2is6s7QVKj0QZ/LHOjz2gU0vSOJvRqcTww2jIfs\nxiB0Sk4cx6DVlqMdMWBqhRh0L8vh7iP6JmwsB8yCh7mgEBC1FzIrQjQPuWt8/eXU\nmPOSO7U1rNeFqHOz14vLh/394VGvIjwXoL9Fm212Q6jZijCy9LdC+Cy7mDkLwmg7\nABsXbk4w2lra6MBO8tgzP033e806LnFktTPzyEyRFThKESy2kOH+kIMt60gUpMwX\n/82S5N7/E5xMgb1tFFyrUOcu35mls/yP/GoWo2rtOLok6sBP3tAwYyUAdIvJ0K9H\nQTYuwm6mj+1e6vQqybkCfk1AW7KEB1FlatEypv2k6QKBgQD9JVZ/BEBEQHyePPoR\nbpW9CQgPkSK6YusnUMkNbzZSA/SCgA1vadvs70Y54cUJa7hpFkIjIjcoI2JyRjzf\nDOfRuT2C1eXU+rA1N0wP69Bd8NZI+70NjRJkhIj6+UUrbdcrOnGF5YG7oIz0RgDr\nzYhWcWtFuY2aZKBq6XCJ+OT9LwKBgQDfQAf2G9vL8Iz06o4ng7iPH7X8b/gI2p2d\n0bnuAUJo0QQ808QCnIYqYEq2BknCDdEXzyrzaT1MBBmuWvdgA/0UAN0e2nz5Jxw2\nufd6uwq/YhCrCT1LI/cOkajF5HbfLPI7IpVfsbF9sQAFIi7UuFJsxTq1u7h+OwgC\nDkKUNHSeyQKBgQDXprU241I0UpNW4i9OJlzdexIo4MUq7xXQmluMXE90MvZbLedE\nIHRANd4ndRO74M5qh5G0CHPgd7RoETnN8lqSKTIjgUCX3S+7Re5AKe2J+Z8y8XGu\nV51xkA55b1zjkGEa7GDFZizMwAsUFYa3WpJowZpW/amJ+2tFaLR8dVHt9QKBgQCM\nMYaOW1I8kHPD/WOFlucYIb7DpoCo9rgR+jj7KBlO/yrdE9K8HRT3mX5xLiO1U73h\naLw9HPJcQRrrbb54siiEHkK9dFEUmSXTjBbIIJsQMgHrliLCg/RKVtgYZW7smSoI\nTqBk9o5SMwujLaMg/BruqTBEHX0u790IhXHz5bjyWQKBgGu96C6qtr8VnmI/Yuj0\ne38ICBdgdqzis3Du+QDsxIrtWVRgOKBVrQsQZhT/Eswd7pLJmQDiDS7fiefhJjIO\nAdhFsD+/+kMNxOLTW7cILbsVDbVucOm+wyZPmQypWn8U4/t6+cFt300bBK0NCG9v\n7YWdAuZ8uu4qmTrhsYo0oD3z\n-----END PRIVATE KEY-----\n",
    client_email: "service-account@assignment-409019.iam.gserviceaccount.com",
    client_id: "111576646278268702973",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/service-account%40assignment-409019.iam.gserviceaccount.com",
    universe_domain: "googleapis.com",
  })
);

// Configure Google Cloud Vision API client
const client = new vision.ImageAnnotatorClient({
  credentials: {
    private_key: CREDENTIALS.private_key,
    client_email: CREDENTIALS.client_email,
  },
});

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define an endpoint for handling file uploads
app.post("/upload", upload.single("image"), async (req, res) => {
  const fileBuffer = req.file.buffer;

  try {
    // Use Google Cloud Vision API to perform text detection
    const [result] = await client.textDetection(fileBuffer);
    const text = result.fullTextAnnotation.text;

    // Respond with the extracted text
    res.json({ text });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/add", async (req, res) => {
  try {
    // console.log(req.body);
    const {
      identification_number,
      name,
      last_name,
      date_of_birth,
      date_of_issue,
      date_of_expiry,
    } = req.body;
  
    const existingEntry = await Id.findOne({ identification_number });
    // Create a new document using the IdModel
    if(!existingEntry){
        const newIdDocument = new Id({
            identification_number,
            name,
            last_name,
            date_of_birth,
            date_of_issue,
            date_of_expiry,
          });
      
          await newIdDocument.save();
    }
    
    // res.send("Id added");
  } catch (error) {
    return res.status(400).json(error);
  }
});


app.get("/allid", async (req, res) => {
    try {
        const entries = await Id.find();
        res.json(entries);
    } catch (error) {
      return res.status(400).json(error);
    }
  });


  app.delete("/delete/:identification_number", async (req, res) => {
    // console.log("api hit");
    try {
    const identificationNumberToDelete = decodeURIComponent(req.params.identification_number);
  
    // Find and delete the entry with the specified identification_number
    const deletedEntry = await Id.findOneAndDelete({ identification_number: identificationNumberToDelete });
  
      if (!deletedEntry) {
        return res.status(404).json({ message: "Entry not found" });
      }
  
      return res.json({ message: "Entry deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error });
    }
  });

  

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
