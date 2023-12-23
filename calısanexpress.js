const express = require("express");
const { soap } = require("strong-soap");
var cors = require('cors')

const app = express();
const port = 3009; // Choose your desired port
app.use(cors());
const UYUMSOFT_WSDL_URL =
  "https://efatura.uyumsoft.com.tr/Services/Integration?wsdl";
const UYUMSOFT_USERNAME = "EmreYavuz";
const UYUMSOFT_PASSWORD = "OAHTOb3@";

function createSoapClient(wsdlUrl, username, password) {
  return new Promise((resolve, reject) => {
    soap.createClient(wsdlUrl, {}, (err, client) => {
      if (err) {
        reject(err);
        return;
      }

      const wsSecurity = new soap.WSSecurity(username, password);
      client.setSecurity(wsSecurity);
      resolve(client);
    });
  });
}

async function getInboxInvoices(client) {
  const { GetInboxInvoices } = client;
  const { result, envelope, soapHeader } = await GetInboxInvoices({
    query: {
      PageIndex: 0,
      PageSize: 20,
      ExecutionStartDate: null,
      ExecutionEndDate: null,
      SetTaken: false,
      OnlyNewestInvoices: false,
    },
  });

  if (result?.GetInboxInvoicesResult?.$attributes?.IsSucceded !== "true") {
    return undefined;
  }

  return result.GetInboxInvoicesResult.Value;
}

app.get("/getUyumsoftInvoices", async (req, res) => {
  try {
    console.log("Creating SOAP client...");
    const client = await createSoapClient(
      UYUMSOFT_WSDL_URL,
      UYUMSOFT_USERNAME,
      UYUMSOFT_PASSWORD
    );

    console.log("Fetching invoice list...");
    const invoiceList = await getInboxInvoices(client);
    if (invoiceList == null) {
      console.error("Invoice list cannot be fetched");
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    const invoiceSummaryList = invoiceList.Items.map((item) => {
      const {
        IssueDate,
        AccountingSupplierParty,
        AccountingCustomerParty,
        LegalMonetaryTotal: { PayableAmount },
      } = item.Invoice;

      return {
        "Issue Date": IssueDate,
        "Accounting Supplier Party": AccountingSupplierParty.Party.PartyName
          .Name,
        "Accounting Customer Party": AccountingCustomerParty.Party.PartyName
          .Name,
        Amount: `${PayableAmount.$value} ${PayableAmount.$attributes.currencyID}`,
      };
    });

    console.log("Invoices:");
    console.table(invoiceSummaryList);
    res.json(invoiceSummaryList);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
