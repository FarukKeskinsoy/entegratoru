const { soap } = require("strong-soap");

const UYUMSOFT_WSDL_URL =
  "https://efatura.uyumsoft.com.tr/Services/Integration?wsdl";

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

async function getInboxInvoices(client,days,months,years,daye,monthe,yeare) {
  const { GetInboxInvoices } = client;
  const { result, envelope, soapHeader } = await GetInboxInvoices({
    query: {
      PageIndex: 0,
      PageSize: 20,
      ExecutionStartDate: `${years}-${months}-${days}`,
      ExecutionEndDate: `${yeare}-${monthe}-${daye}`,
      SetTaken: false,
      OnlyNewestInvoices: false,
    },
  });

  if (result?.GetInboxInvoicesResult?.$attributes?.IsSucceded !== "true") {
    return undefined;
  }

  return result.GetInboxInvoicesResult.Value;
}

async function getInboxInvoice(client,invoiceId) {
  const { GetInboxInvoice } = client;
  const { result, envelope, soapHeader } = await GetInboxInvoice({
    
        invoiceId:invoiceId
    
  });

  if (result?.GetInboxInvoiceResult?.$attributes?.IsSucceded !== "true") {
    return undefined;
  }

  return result.GetInboxInvoiceResult.Value;
}
async function getInboxInvoicesData(client) {
  const { GetInboxInvoicesData } = client;
  const { result, envelope, soapHeader } = await GetInboxInvoicesData({
    query: {
        PageIndex: 0,
        PageSize: 20,
        ExecutionStartDate: null,
        ExecutionEndDate: null,
        SetTaken: false,
        OnlyNewestInvoices: false,
      },
  });

  if (result?.GetInboxInvoicesDataResult?.$attributes?.IsSucceded !== "true") {
    return undefined;
  }

  return result.GetInboxInvoicesDataResult.Value;
}

module.exports = {
  createSoapClient,
  getInboxInvoices,
  getInboxInvoice,
  UYUMSOFT_WSDL_URL,
};
