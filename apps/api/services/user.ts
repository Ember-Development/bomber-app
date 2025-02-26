//FIXME: replace the any once we have full types
const validateUser = (user: any) => {
  const userHasRoleOtherThanPlayer =
    user.adminID || user.coachID || user.regCoachID || user.parentID;

  //TODO: figure out how to eval this quickly... worst case make query
  let userIsPlayer = true;
  let playerAgeGroup = "8u"; //TODO: use the enums when types are defined

  const userIs14PlusPlayer =
    userIsPlayer &&
    (playerAgeGroup === "14u" ||
      playerAgeGroup === "16u" ||
      playerAgeGroup === "18u" ||
      playerAgeGroup === "alumni");

  const errors = [];

  if (!user.phone) {
    if (userHasRoleOtherThanPlayer)
      errors.push("User roles other than players must have phone number");
  }
  if (!user.email) {
    if (userHasRoleOtherThanPlayer)
      errors.push("User roles other than players must have an email for login");
    else if (userIs14PlusPlayer)
      errors.push("Players 14 and up require an email for login");
  }
  if (!user.pass)
    if (userHasRoleOtherThanPlayer)
      errors.push(
        "User roles other than players must have a password for login",
      );
    else if (userIs14PlusPlayer)
      errors.push("Players 14 and up require a password for login");

  if (errors.length > 0) return errors;
};

export { validateUser };
