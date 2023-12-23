const express = require("express");
const bodyParser = require("body-parser");
const { soap } = require("strong-soap");
const cors = require('cors');
const { createSoapClient, getInboxInvoices, getInboxInvoice } = require("./getInvoices");
const { isEInvoiceUser } = require("./isEInvoiceUser");

const app = express();
const port = 3008; // Choose your desired port

app.use(bodyParser.json());
app.use(cors());


const UYUMSOFT_WSDL_URL =
  "https://efatura.uyumsoft.com.tr/Services/Integration?wsdl";



app.post("/getUyumsoftInvoices", async (req, res) => {
  const { UYUMSOFT_USERNAME, UYUMSOFT_PASSWORD,days,months,years,daye,monthe,yeare } = req.body;

  try {
    console.log("Creating SOAP client...");
    const client = await createSoapClient(
      UYUMSOFT_WSDL_URL,
      UYUMSOFT_USERNAME,
      UYUMSOFT_PASSWORD
    );

    console.log("Fetching invoice list...");
    const invoiceList = await getInboxInvoices(client,days,months,years,daye,monthe,yeare);
    if (invoiceList == null) {
      console.error("Invoice list cannot be fetched");
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    const invoiceSummaryList = invoiceList.Items.map((item) => {
      const {
        ID,
        UUID,
        InvoiceTypeCode,
        ProfileID,
        IssueDate,
        AccountingSupplierParty,
        AccountingCustomerParty,
        InvoiceLine,
        LegalMonetaryTotal: { PayableAmount },
      } = item.Invoice;
      const {TargetCustomer} =item;

      return {
        cariAdi: AccountingSupplierParty?.Party?.PartyName?.Name||TargetCustomer?.$attributes.Title,
        ettn:UUID,
        faturaNo:ID,
        faturatarihi: IssueDate,
        faturaTipi:InvoiceTypeCode,
        senaryo:ProfileID,
        cariVknTckn: TargetCustomer?.$attributes?.VknTckn,
        alias:TargetCustomer?.$attributes?.Alias,
        //Customer: AccountingCustomerParty?.Party?.PartyName?.Name,
        items:JSON.stringify(InvoiceLine),
        genelToplam: `${PayableAmount.$value}`,
        curr:`${PayableAmount.$attributes.currencyID}`
      };
    });
    
    res.json({info:invoiceList.$attributes,list:invoiceSummaryList});
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/getInboxInvoice", async (req, res) => {

//const invoiceId="A488F497-A8D1-414A-9C19-5F0E15A35EF4"
  const { UYUMSOFT_USERNAME, UYUMSOFT_PASSWORD,invoiceId} = req.body;

  try {
    console.log("Creating SOAP client...");
    const client = await createSoapClient(
      UYUMSOFT_WSDL_URL,
      UYUMSOFT_USERNAME,
      UYUMSOFT_PASSWORD
    );

    console.log("Fetching invoice list...");
    const invoiceList = await getInboxInvoice(client,invoiceId);
    if (invoiceList == null) {
      console.error("Invoice list cannot be fetched");
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    console.log("Invoices:");
    console.table(invoiceList);
    res.json(invoiceList);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/isEInvoiceUser", async (req, res) => {
  const { UYUMSOFT_USERNAME, UYUMSOFT_PASSWORD } = req.body;

  try {
    console.log("Creating SOAP client...");
    const client = await createSoapClient(
      UYUMSOFT_WSDL_URL,
      UYUMSOFT_USERNAME,
      UYUMSOFT_PASSWORD
    );

    console.log("Fetching invoice list...");
    const invoiceList = await isEInvoiceUser(client);
    if (invoiceList == null) {
      console.error("Invoice list cannot be fetched");
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    // const invoiceSummaryList = invoiceList.Items.map((item) => {
    //   const {
    //     IssueDate,
    //     AccountingSupplierParty,
    //     AccountingCustomerParty,
    //     LegalMonetaryTotal: { PayableAmount },
    //   } = item.Invoice;

    //   return {
    //     "Issue Date": IssueDate,
    //     "Accounting Supplier Party": AccountingSupplierParty.Party.PartyName
    //       .Name,
    //     "Accounting Customer Party": AccountingCustomerParty.Party.PartyName
    //       .Name,
    //     Amount: `${PayableAmount.$value} ${PayableAmount.$attributes.currencyID}`,
    //   };
    // });

    console.log("Invoices:");
    console.table(invoiceList);
    res.json(invoiceList);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
