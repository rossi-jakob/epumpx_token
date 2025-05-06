export const CreateFloatingImage = () => {
  return (
    <div className=" relative hidden md:block">
      <div className="absolute top-[150px] -left-16   ">
        <img src="/homepage1.svg" alt="Token" className="w-50 h-50" />
      </div>{" "}
      <div className="absolute -top-22 left-40 ">
        <img src="/create-left-2.svg" alt="Token" className="w-50 h-50 " />
      </div>
      <div className="absolute -top-22 right-40 ">
        <img src="/create-right-2.svg" alt="Token" className="w-50 h-50" />
      </div>
      <div className="absolute top-[150px] -right-16  ">
        <img src="/create-right-1.svg" alt="Token" className="w-50 h-50" />
      </div>
    </div>
  );
};
