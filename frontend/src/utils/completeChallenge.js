import axios from "axios";

export const completeChallenge = async ({
  challenge,
  setLoading,
  setErrorMsg,
  navigate,
  redirectTo = "/challenges",
}) => {
  try {
    if (setLoading) setLoading(true);
    if (setErrorMsg) setErrorMsg("");

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      if (setErrorMsg) {
        setErrorMsg("You are not logged in. Please login and try again.");
      }
      return false;
    }

    const challengeId = challenge?._id;

    console.log("Challenge object:", challenge);
    console.log("Sending challengeId:", challengeId);

    if (!challengeId) {
      if (setErrorMsg) {
        setErrorMsg(
          "This challenge is not linked to the database yet. Please add it in Admin Challenges first."
        );
      }
      return false;
    }

    const response = await axios.post(
      "http://localhost:5000/api/completed-challenges",
      { challengeId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Challenge completed:", response.data);

    setTimeout(() => {
      navigate(redirectTo);
    }, 1500);

    return true;
  } catch (error) {
    console.error("Error completing challenge:", error);
    console.log("Backend error:", error.response?.data);

    if (setErrorMsg) {
      setErrorMsg(
        error.response?.data?.message ||
          "Could not complete challenge. Please try again."
      );
    }

    return false;
  } finally {
    if (setLoading) setLoading(false);
  }
};