import React, { useState, useEffect } from 'react'
import axios from "axios";
import UserDisplay from '../UserDisplay/UserDisplay';

const url = "http://localhost:5000/Users";

const fetchHandler = async () => {
  return await axios.get(url).then((res) => res.data);
}

function UserManagement() {

  const [Users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchHandler().then((data) => setUsers(data));
  }, [])

  // filtered + searched list
  const filteredUsers = Users.filter((user) => {
    const matchesSearch =
      user.fullname?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.student_id?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || user.verification_status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-white p-8">

      {/* Header */}
      <div className="mb-8">
        <p className="text-cyan-500 font-semibold tracking-widest text-sm uppercase mb-1">University Marketplace</p>
        <h1 className="text-4xl font-black text-purple-950">All Students</h1>
        <div className="h-1 w-16 bg-cyan-500 mt-3 rounded-full"></div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-4 mb-8 flex-wrap">

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, email, student ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[250px] border-b-2 border-purple-200 focus:border-cyan-500 outline-none px-4 py-2 text-black placeholder-gray-400 transition-all duration-200"
        />

        {/* Filter by status */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border-b-2 border-purple-200 focus:border-cyan-500 outline-none px-4 py-2 text-black transition-all duration-200"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>

        {/* Result count */}
        <div className="flex items-center text-sm text-gray-400">
          Showing <span className="text-purple-950 font-bold mx-1">{filteredUsers.length}</span> of <span className="text-purple-950 font-bold mx-1">{Users.length}</span> students
        </div>

      </div>

      {/* Student cards */}
      <div className="grid grid-cols-1 gap-6">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user.email}>
              <UserDisplay Users={user} />
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No students found matching your search.</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default UserManagement