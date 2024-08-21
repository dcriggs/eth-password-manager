"use client";

import React from "react";
import PasswordManagement from "../../components/custom/PasswordManagement";
import type { NextPage } from "next";

const SharedIn: NextPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">My Passwords</h1>
      <PasswordManagement />
    </div>
  );
};

export default SharedIn;
