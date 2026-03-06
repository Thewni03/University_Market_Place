import React from "react";

function Profile() {

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <h2>No user logged in</h2>;
  }

  return (
    <div style={{padding:"40px"}}>
      <h1>My Profile</h1>

      <p><strong>Name:</strong> {user.fullname}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Student ID:</strong> {user.student_id}</p>

    </div>
  );
}

export default Profile;