import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function ContactSection() {
  return (
    <section className="py-16 bg-[#282D44] component-edge-root">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <h2 className="text-3xl md:text-6xl font-bold text-white mb-4">
          Still have questions?
        </h2>
        <h3 className="text-6xl font-bold text-white mb-6">Contact us</h3>
        <p className="text-gray-400 mb-8 text-2xl ">
          If you have any questions or would like to learn more, please feel
          free to contact us.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="flex items-center border-2 border-gray-400 rounded-full px-4 py-2 bg-[#191C2F] focus-within:border-yellow-500">
            <Mail className="text-white w-5 h-5 mr-2" />
            <input
              type="email"
              placeholder="Enter Email Address"
              className="bg-transparent text-white placeholder-white focus:outline-none w-full"
            />
          </div>
          <Button className=" p-4 font-bold text-md text-white">Get In Touch</Button>
        </div>
      </div>
    </section>
  );
}
