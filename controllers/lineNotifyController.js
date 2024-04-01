const qs = require('qs')
const axios = require('axios')

const getCode = (req, res) => {
  const userId = req.query.state
  const code = req.query.code

  // Request to LINE Authenthication Server
  const url = 'https://notify-bot.line.me/oauth/token'
  const jsonData = {
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: 'https://capstone23.sit.kmutt.ac.th/tt3/api/notifyredirect',
    client_id: 'e48bP0urIm25wxyt3PtwM5',
    client_secret: '8arayYmWrmewnhQykYRjt9i39Ml6RjsZbzaQvEWE4QZ',
  }
  const requestOption = {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: qs.stringify(jsonData),
    url,
  }
  axios(requestOption).then(async (lineRes) => {
    console.log(lineRes.data.accsess_token)
  })
}

module.exports = { getCode }
