import { SignUp2InputProps } from "@/schema/signup.schema";
import { motion } from "framer-motion";
import React from "react";
import { UseFormHandleSubmit } from "react-hook-form";
import { ClickButton } from "../button/Button";
import Title from "../titles/Title";
import PlanCard from "./PlanCard";
import { IoChevronBack } from "react-icons/io5";

interface Props {
  first?: boolean;
  handleSubmit?: UseFormHandleSubmit<SignUp2InputProps>;
  handleSignUp?: (e: SignUp2InputProps) => void;
  handleBack: () => void;
}

export const Plans = ({
  first = false,
  handleSignUp,
  handleSubmit,
  handleBack,
}: Props) => {
  const planTypes = [
    {
      type: "monthly",
      price: 500,
      desc: "billed monthly",
    },
    {
      type: "half-yearly",
      price: 2800,
      desc: "billed half-yearly",
    },
    {
      type: "annual",
      price: 5000,
      desc: "billed annually",
    },
  ];
  return (
    <motion.section
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      className="flex relative justify-center items-center flex-col gap-y-10  "
    >
      {/* back btn */}
      <button
        onClick={handleBack}
        className="absolute p-2 shadow-md  dark:bg-dark bg-light rounded-full top-6 left-4"
      >
        <IoChevronBack className="text-2xl font-bold rounded-full text-pri" />
      </button>
      <Title underline>Our Plans</Title>
      {/*    Cards  */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        {planTypes.map((type, i) => (
          <PlanCard key={i} plan={type} />
        ))}
      </div>
      {/*      Free Plan    */}
      {first && (
        <>
          <p className="text-dark dark:text-light text-2xl md:text-3xl font-medium ">
            As This Is Your First Time Here, Enjoy{" "}
            <span className="text-pri font-bold underline underline-offset-8">
              {" "}
              1 Month Free Trial
            </span>{" "}
            Of Our Service
          </p>
          <ClickButton
            onClick={
              handleSignUp && handleSubmit
                ? handleSubmit(handleSignUp)
                : () => console.log("...")
            }
            width
          >
            <h1>Sign Up</h1>
          </ClickButton>
        </>
      )}
    </motion.section>
  );
};
