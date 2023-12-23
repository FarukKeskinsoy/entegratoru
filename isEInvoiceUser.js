const { soap } = require("strong-soap");


async function isEInvoiceUser(client) {
  const { IsEInvoiceUser } = client;
  const { result, envelope, soapHeader } = await IsEInvoiceUser({vknTckn:"3341183468"});


  return result;
}


module.exports = {
    isEInvoiceUser
};
