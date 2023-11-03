import axios from "axios";
import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";

function App() {
  return (
    <div class="bg-[#FF8A80] flex justify-center items-center h-screen">
      <div class="w-1/2 h-screen hidden lg:block">
        <img src="https://i.ibb.co/5Brk3PS/Picsart-23-11-02-13-43-50-059.png" alt="Placeholder Image" class="object-cover w-full h-full" />
      </div>
      <div class="lg:p-36 md:p-52 sm:20 p-8 w-full lg:w-1/2">
        <h1 class="text-7xl font-sans font-bold mb-4 text-white">Damar Boutique</h1>
        <h1 class="text-2xl font-semibold mb-4 text-white">Login</h1>
        <form action="#" method="POST">
          <div class="mb-4">
            <label for="username" class="block text-white">Username</label>
            <input type="text" id="username" name="username" class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500" autocomplete="off" />
          </div>
          <div class="mb-4">
            <label for="password" class="block text-white">Password</label>
            <input type="password" id="password" name="password" class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500" autocomplete="off" />
          </div>
          <div class="mb-4 flex items-center">
            <input type="checkbox" id="remember" name="remember" class="text-blue-500" />
            <label for="remember" class="text-white ml-2">Remember Me</label>
          </div>
          <div class="mb-6 text-red-800">
            <a href="#" class="hover:underline">Forgot Password?</a>
          </div>
          <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full">Login</button>
        </form>
        <div class="mt-6 text-red-800 text-center">
          <a href="#" class="hover:underline">Sign up Here</a>
        </div>
      </div>
    </div>
  );
}

export default App;
