import React, { useState } from "react";
import { BsCart, BsSearch, BsPersonCircle } from "react-icons/bs";
import { GiHamburgerMenu } from "react-icons/gi";
import { MdFavoriteBorder } from "react-icons/md";
import rains from "../assets/rains.png";
import LoginModal from "./LoginModal";

function Navigationbar() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // State to manage the login modal visibility
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownSubcategory, setDropdownSubcategory] = useState(null); // State to manage the dropdown visibility [Category
  const [isLogin, setIsLogin] = useState(true);
  const categories = ["NEW IN", "MEN", "WOMEN", "BAGS", "ACCESSORIES"];
  const newIn = ["New Arrivals", "Best Sellers", "Rains Essentials"];
  // const men = ["Jackets", "Tops", "Bottoms", "Accessories"];
  // const women = ["Jackets", "Tops", "Bottoms", "Accessories"];
  // const bags = ["Backpacks", "Totes", "Travel Bags", "Accessories"];
  const accessories = ["Caps", "Bags", "Accessories"];
  const accounts = ["Profile", "Address Book", "My Order", "Change My Password"];
  const accountsDropdown = ["Profile", "Address Book", "My Order", "Change My Password", "Search", "Cart", "Favorites"];

  const openLoginModal = () => setIsLoginModalOpen(true);
  const handleIconClick = () => setDropdownVisible(!dropdownVisible);
  const handleSubcategoryClick = (subcategory) => setDropdownSubcategory(subcategory);
  const handleLogout = () => setIsLogin(false);

  return (
    <div className="w-full bg-white h-20 flex items-center justify-around">
      <div className="flex items-center gap-16">
        <img src={rains} alt="Logo" className="w-26 h-10" />
        <div className="hidden space-x-4 lg:flex">
          {categories.map((category, index) => {
            const joinedCategories = category.toLowerCase().replace(" ", "-");
            return (
              <>
                <p key={index} className="text-black text-md font-semibold hover:underline cursor-pointer" onClick={() => handleSubcategoryClick(category)}>
                  {category}
                </p>
                {dropdownSubcategory === category && (
                  <div className="absolute top-20 w-full right-0 h-48 bg-white ring-1 ring-black ring-opacity-5 z-10">
                    {category === "NEW IN" && (
                      <div className="flex flex-row">
                        <div className="w-[50vw]">
                          {newIn.map((subcategory, index) => {
                            const joinedSubcategory = subcategory.toLowerCase().replace(/\s/g, "-");
                            return (
                              <a key={index} href={`/${joinedCategories}/${joinedSubcategory}`}>
                                <p className="text-gray-700 hover:bg-gray-100 block px-4 py-2 text-sm">{subcategory}</p>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            );
          })}
        </div>
      </div>
      {isLogin ? (
        <>
          <div className="hidden gap-8 lg:flex items-center">
            <BsSearch className="text-xl cursor-pointer" />
            <img
              src="https://images.unsplash.com/photo-1556294778-037d36802a75?auto=format&fit=crop&q=80&w=1527&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Profile"
              className="w-6 h-6 rounded-full cursor-pointer"
              onClick={handleIconClick}
            />
            {dropdownVisible && (
              <div className="absolute top-16 w-48 h-48 bg-white ring-1 ring-black ring-opacity-5 z-10">
                {accounts.map((account, index) => {
                  const joinedAccounts = account.toLowerCase().replace(/\s/g, "-");
                  return (
                    <a key={index} href={`/account/${joinedAccounts}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      {account}
                    </a>
                  );
                })}
                <p className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" onClick={handleLogout}>
                  Log Out
                </p>
              </div>
            )}

            <MdFavoriteBorder className="text-xl cursor-pointer" />
            <BsCart className="text-xl cursor-pointer" />
          </div>

          {/* Mobile */}
          <div className="flex lg:hidden gap-3 z-10">
            {/* Category sm */}
            <GiHamburgerMenu className="text-xl cursor-pointer flex lg:hidden" onClick={handleIconClick} />
            {dropdownVisible && (
              <div className="absolute top-20 w-full h-70 bg-white ring-1 ring-black ring-opacity-5 right-0 lg:hidden">
                {/* Categories sm */}
                <div className="flex flex-row">
                  <div className="w-[50vw]">
                    {categories.map((category, index) => {
                      const joinedCategories = category.toLowerCase().replace(" ", "-");
                      return (
                        <a key={index} href={`/${joinedCategories}`}>
                          <p className="text-gray-700 hover:bg-gray-100 block px-4 py-2 text-sm">{category}</p>
                        </a>
                      );
                    })}
                  </div>
                  {/* Profile sm */}
                  <div className="w-[50vw]">
                    {accountsDropdown.map((account, index) => {
                      const joinedAccounts = account.toLowerCase().replace(" ", "-");
                      return (
                        <a key={index} href={`/account/${joinedAccounts}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                          {account}
                        </a>
                      );
                    })}
                    <p className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" role="menuitem" onClick={handleLogout}>
                      Log Out
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <a onClick={openLoginModal} className="text-black text-xl font-semibold hover:underline cursor-pointer">
          Log in
        </a>
      )}
      {isLoginModalOpen && <LoginModal isOpen={isLoginModalOpen} isClose={() => setIsLoginModalOpen(false)} />}
    </div>
  );
}

export default Navigationbar;
