export const generateOTP = (): string => {
  // Generates a random 4 digit number
  // E.g. Math.random() gives 0.123456... -> multiplied by 9000 gives 1111.11... + 1000 = 2111
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const sendOTP = async (phone: string, otp: string) => {
  // In a real app, you would connect to Twilio, Termii, or an email service here.
  // For now, we simulate sending it by printing to the server console.
  console.log(`[SIMULATED SMS] Sending OTP ${otp} to phone number ${phone}`);
  return true;
};
