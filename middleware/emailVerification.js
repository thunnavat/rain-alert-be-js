const otpGenerator = require('otp-generator')

const emailOtpMap = new Map()
const otpExpiryTime = 10 * 60 * 1000

function generateOTP(email) {
  const otp = otpGenerator.generate(6, {
    digits: true,
    specialChars: false,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
  })
  const otpData = {
    otp: otp,
    expiryTime: Date.now() + otpExpiryTime,
  }
  emailOtpMap.set(email, otpData)
  return otp
}

function getEmailOTP(email) {
  return emailOtpMap.get(email)
}

function setEmailOTP(email, otp) {
  const otpData = {
    otp: otp,
    expiryTime: Date.now() + otpExpiryTime,
  }
  emailOtpMap.set(email, otpData)
}

function deleteEmailOTP(email) {
  emailOtpMap.delete(email)
}

module.exports = { generateOTP, getEmailOTP, setEmailOTP, deleteEmailOTP }
