export default function Partners() {
  const partners = [
    {
      name: "Royal Fox",

      description:
        "Royal Fox token is a powerful multi-chain integration tool designed to empower users with seamless cross-chain capabilities, enabling them to access different chains easily.",
    },
    {
      name: "Delta",

      description:
        "Delta is dedicated to providing innovative solutions for decentralized finance. Their cutting-edge technology enables secure and efficient transactions, making them a trusted partner in the blockchain space.",
    },
    {
      name: "Butterfly",

      description:
        "Butterfly is a leading decentralized exchange service that focuses on speed and security. Their platform provides a seamless trading experience, making it easier for users to participate in the decentralized economy.",
    },
  ];

  return (
    <section className="py-16 bg-[#282D44] component-edge-root">
      <div className="container mx-auto px-4 flex flex-col items-center gap-4">
        <div>
          <h2 className="text-6xl font-bold text-white text-center mb-4">
            Our Partnership
          </h2>
          <p className="text-white/76 text-2xl text-center mb-10">
            Collaborating with Industry Leaders to Drive Innovation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="bg-[#191C2F]  p-6 relative  !rounded-3xl w-[350px] "
            >
              <div className="flex items-center space-x-2  absolute -top-[30.26px] left-[22.69px]">
                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-xl">
                  <img
                    src="/fox.svg"
                    alt="Partnership"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="">
                  {" "}
                  <h3 className="text-xl  text-white mb-1">{partner.name}</h3>
                </div>
              </div>

              <p className="text-[#C0BFC5] text-sm">{partner.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
