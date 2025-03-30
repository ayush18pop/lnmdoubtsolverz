export const validateLNMIITEmail = (email) => {
  // Regular expression for LNMIIT email format
  // 2[NUM]XXX[NUM][NUM][NUM]@lnmiit.ac.in
  const emailRegex = /^2[0-9][a-zA-Z]{3}[0-9]{3}@lnmiit\.ac\.in$/;

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message:
        "Please use your LNMIIT email address (e.g., 23ucs666@lnmiit.ac.in)",
    };
  }

  // Extract the roll number part
  const rollNumber = email.split("@")[0];

  // Validate year (should be current year or previous year)
  const currentYear = new Date().getFullYear().toString().slice(-2);
  const emailYear = rollNumber.slice(0, 2);

  if (parseInt(emailYear) > parseInt(currentYear)) {
    return {
      isValid: false,
      message: "Invalid year in email address",
    };
  }

  return {
    isValid: true,
    message: "",
  };
};
