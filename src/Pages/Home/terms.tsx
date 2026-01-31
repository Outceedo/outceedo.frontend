import { motion } from "motion/react";
import { FileText, ChevronRight } from "lucide-react";
import Navbar from "./Navbar";
import FooterSection from "./FooterSection";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="mb-10"
  >
    <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 mb-4 flex items-center gap-2">
      <ChevronRight className="w-5 h-5 text-red-500" />
      {title}
    </h2>
    <div className="text-gray-600 font-medium leading-relaxed space-y-4 pl-7">
      {children}
    </div>
  </motion.section>
);

function Terms() {
  return (
    <div className="bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_#000_1px,_transparent_1px)] [background-size:40px_40px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-4 inline-flex items-center gap-2 text-red-500 font-black tracking-[0.3em] uppercase text-xs"
            >
              <span className="h-[2px] w-12 bg-red-500"></span>
              Legal
              <span className="h-[2px] w-12 bg-red-500"></span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl font-black tracking-tighter text-gray-900 uppercase italic mb-6"
            >
              TERMS OF <span className="text-red-500">USE</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-3 bg-gray-50 border border-gray-100 px-6 py-3 rounded-2xl"
            >
              <FileText className="w-5 h-5 text-red-500" />
              <span className="text-gray-600 font-medium">Please read these terms carefully</span>
            </motion.div>
          </div>

          {/* Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-gray-50 rounded-[2.5rem] p-8 md:p-12 border border-gray-100"
          >
            {/* Introduction */}
            <Section title="Introduction">
              <p>
                Welcome to Outceedo, please read these Terms of Use carefully before using outceedo.com and its services. These Terms of Use ("Terms") apply to your access to, and use of the website and other online products and services (collectively, our "Services") provided by Outceedo Ltd.
              </p>
              <p>
                For the purpose of these Terms of Use "we", "us" and "our" means outceedo, outceedo.com, The Company and/or Outceedo Limited, while references to "You" and "Your" refer to the individuals, companies or users accessing and/or using our website/mobile app/services.
              </p>
              <p>
                By accessing or using our Website, Mobile App or Services, you agree to comply with and be legally bound by these Terms of Use ("Terms or Agreement"). And you are entering into a legally binding agreement with outceedo.com and/or Outceedo Limited (its parent company) whether or not you become a registered user of our Website/mobile app/Services.
              </p>
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <span className="font-bold text-red-600">Important:</span> If you do not: a) read, b) fully understand and c) agree to these Terms of Use, you must immediately leave the Website and avoid/discontinue the use of our Website/App/Services.
              </div>
            </Section>

            {/* Who We Are */}
            <Section title="Who We Are">
              <p>
                Outceedo is an Online Marketplace (b2c eCommerce website) that connects worldwide sports experts and aspiring sports players.
              </p>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <p className="font-bold text-gray-900">Outceedo.com</p>
                <p>Registered in Scotland, United Kingdom (Registration number SC853014)</p>
                <p>Registered address: 82 Berryden Gardens, Aberdeen, United Kingdom, AB25 3RW</p>
              </div>
            </Section>

            {/* Our Platform */}
            <Section title="Our Platform">
              <p>
                Outceedo is an Online Marketplace (b2c eCommerce website) that connects worldwide sports experts and aspiring sports players.
              </p>
              <p>
                We serve worldwide sports experts, aspiring sports players, sports related clubs, academies, companies, organisations, audience/fans/followers, sports media companies, sports sponsors with an online marketplace and many other services.
              </p>
            </Section>

            {/* User Types and Our Services */}
            <Section title="User Types and Our Services">
              <p className="font-bold text-gray-900 mb-3">Users: Players, Sports Experts, Sports Teams, Sports Sponsors, Fans/Followers</p>
              <ul className="list-none space-y-3">
                <li className="bg-white rounded-xl p-4 border border-gray-100">
                  <span className="font-bold text-red-500">Sports Experts:</span> Create profile, add personal details, photos, videos, certificates, awards, social media links and offer various services to worldwide Sports Players.
                </li>
                <li className="bg-white rounded-xl p-4 border border-gray-100">
                  <span className="font-bold text-red-500">Sports Players:</span> Create profile, add personal details, photos, videos, certificates, awards, social media links and book worldwide services provided by Sports Experts, Apply Sponsorships from Sponsors.
                </li>
                <li className="bg-white rounded-xl p-4 border border-gray-100">
                  <span className="font-bold text-red-500">Sports Teams:</span> Create profile, add team details, photos, videos, certificates, awards, social media links and Apply Sponsorships from Sponsors.
                </li>
                <li className="bg-white rounded-xl p-4 border border-gray-100">
                  <span className="font-bold text-red-500">Sports Sponsors:</span> Create profile, add company details, photos, videos, social media links and Accept/Approve Sponsorship Applications.
                </li>
                <li className="bg-white rounded-xl p-4 border border-gray-100">
                  <span className="font-bold text-red-500">Fans/Followers:</span> See/Rate/Like/Share/Write Reviews on information, photos & videos of sport experts and sports players.
                </li>
              </ul>
            </Section>

            {/* User Eligibility */}
            <Section title="User Eligibility">
              <p>
                Our Services are available only to individuals and companies that can form legally binding contracts under applicable law. The Website/Online Platform, mobile app and Services are intended solely and strictly for Individuals/Users who are 18 years of age or older.
              </p>
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <span className="font-bold text-red-600">For Minors:</span> If the player is a minor then it must be a responsibility of the parents or legal guardians to create, upload, update and maintain the account on behalf of minors. All the activities performing in the website must be done by parents or Legal Guardians of that minor player.
              </div>
            </Section>

            {/* Users Obligation/Responsibility */}
            <Section title="Users Obligation/Responsibility">
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h4 className="font-black text-gray-900 uppercase tracking-tight mb-4">You Should:</h4>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>Be aged 18 years or older</li>
                    <li>Register your account on the website/mobile app</li>
                    <li>Fill the personal profile with complete and accurate personal details</li>
                    <li>Provide complete and accurate photos, videos, data/information</li>
                    <li>Provide training, experience, PGV, Disclosure Documents/certificates</li>
                    <li>Maintain confidentiality with your login details</li>
                    <li>Pay appropriate subscription Fee, taxes, etc</li>
                    <li>Provide services which you advertise in our platform</li>
                    <li>Have ownership on intellectual property or other material provided by you</li>
                    <li>Agree to all relevant policies (terms of use, terms & conditions, privacy policy, etc)</li>
                  </ul>
                </div>
                <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                  <h4 className="font-black text-red-600 uppercase tracking-tight mb-4">You Should Not:</h4>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>Use our website, mobile app and services if you are not above 18 years of age</li>
                    <li>Upload contents that is inappropriate to the public/people/users</li>
                    <li>Upload false, offensive, illegal, harassing, harmful, abusive, lewd, obscene, inaccurate, pornographic, misleading, threatening, defamatory or libellous content</li>
                    <li>Upload content that infringes the copyright, trademark or other rights of third parties</li>
                    <li>Interfere or manipulate with any other user accounts or materials</li>
                    <li>Transfer your account details and user ID to another party without our consent</li>
                    <li>Distribute viruses or any other technologies that may harm outceedo.com</li>
                    <li>Use any robot, spider, scraper or other automated means to access our services</li>
                    <li>Collect information about users without our consent</li>
                    <li>Fail to pay for services</li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* Parent/Guardian Agreement */}
            <Section title="Parent/Guardian Agreement">
              <p>
                If a player is a minor (below 18 years of age) then, ONLY a parent or legal guardian must create, access and maintain their profile in our website/mobile app. As a parent or legal guardian of a Minor Player, you acknowledge and represent to Outceedo that you have the right and authority to make decisions on behalf of the child concerning the care, custody and control of each Minor Player.
              </p>
              <p>
                By signing this Agreement, you are binding each of your Minor Player(s) to its terms, including but not limited to the ASSUMPTION OF RISK, WAIVER OF LIABILITY, DEFENSE AND INDEMNIFICATION, ARBITRATION AGREEMENT WITH CLASS ACTION WAIVER and HEALTH AND SAFETY provisions.
              </p>
            </Section>

            {/* Confidentiality */}
            <Section title="Confidentiality">
              <ul className="list-disc pl-6 space-y-2">
                <li>Your User ID and Password must be kept confidential at all times</li>
                <li>Your Password/s should never be shared or exposed to others</li>
                <li>You shall be solely responsible for maintaining the confidentiality of your User Id and password</li>
                <li>You will not let anyone else access your account</li>
                <li>You are responsible for the confidentiality and use of all IDs, passwords, security data</li>
                <li>You shall not use a false name or email address owned or controlled by another person</li>
                <li>You will update your registration information which remains true, accurate, correct and complete</li>
                <li>You will conduct yourself in a professional manner in all your interactions with outceedo.com</li>
              </ul>
            </Section>

            {/* Copyrights, Trademarks and Intellectual Property */}
            <Section title="Copyrights, Trademarks and Intellectual Property">
              <p>
                All content included in or made available through outceedo.com and its subsidiaries, such as concepts, workflows, layouts, data bases, illustrations, codes, flash presentations, plug ins, text, designs, graphics, logos, button icons, images, digital data and data compilations, software, applications, delivery mechanisms, configurations are the properties of outceedo.com and is governed by the Copyright, Designs and Patents Act 1988.
              </p>
              <p>
                The trademarks, service marks and trade dress of outceedo.com may not be used or reproduced without prior written approval from outceedo.com.
              </p>
            </Section>

            {/* User Accounts */}
            <Section title="User Accounts">
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h4 className="font-bold text-red-500 mb-3">i) Sports Experts</h4>
                  <p className="text-gray-600 mb-3">
                    You acknowledge and agree to create a profile/account with us and agree to complete the personal profile with accurate, true, current and complete information. Sports Experts must provide required information (full name, address, email id, phone number, city & country) to identify you as said category.
                  </p>
                  <p className="text-gray-600 mb-3">
                    You agree to submit your Sports Registration or License certificates, PVG certificates, Disclose Certificate, Disclosure & Barring Service Certificate, Social Media Accounts to us.
                  </p>
                  <p className="text-gray-600">
                    Outceedo Ltd will deduct 10% from your earnings as a commission before we transfer the remaining (90%) earnings to you.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h4 className="font-bold text-red-500 mb-3">ii) Players</h4>
                  <p className="text-gray-600 mb-3">
                    You acknowledge and agree to create a profile/account with us and agree to complete the personal profile with accurate, true, current and complete information.
                  </p>
                  <p className="text-gray-600 mb-3">
                    For Minor Player accounts, their legal parents or guardians bear full responsibility for creating, updating, maintaining of minor player accounts and all transactions and interactions with the experts.
                  </p>
                  <p className="text-gray-600">
                    You pay subscription fee of £10 each month to Outceedo Ltd to get access to additional features or functionalities.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h4 className="font-bold text-red-500 mb-3">iii) Teams</h4>
                  <p className="text-gray-600">
                    You acknowledge and agree to create a profile/account with us. The only people who are authorized to create Sports Team account are users above 18 years of age and must be by the team's coach only.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h4 className="font-bold text-red-500 mb-3">iv) Sponsors</h4>
                  <p className="text-gray-600">
                    You acknowledge and agree to create a profile/account with us. The only people who are authorized to create Sports Sponsor account are users above 18 years of age and must be an accredited sponsor only.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h4 className="font-bold text-red-500 mb-3">v) Fans/Followers</h4>
                  <p className="text-gray-600">
                    You acknowledge and agree to create a profile/account with us. The only people who are authorized to create Fans/Followers account are users above 18 years of age.
                  </p>
                </div>
              </div>
            </Section>

            {/* Bookings and Payment Methods */}
            <Section title="Bookings and Payment Methods">
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h4 className="font-bold text-red-500 mb-3">Players</h4>
                  <p className="text-gray-600 mb-3">
                    You acknowledge and agree to pay outceedo.com for the services (Premium Account, Expert Bookings, Marketing) you have chosen by following payment methods:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-600">
                    <li>Debit/Credit Cards using our third party (Stripe) payment gateway</li>
                    <li>Paying in Great British Pounds (GBP £)</li>
                  </ul>
                  <p className="text-gray-600 mt-3">
                    Credit cards will incur an additional transaction fee of 3.5% including VAT of the total payable price. There is no transaction fee if payment is made by debit card.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h4 className="font-bold text-red-500 mb-3">Sports Experts</h4>
                  <p className="text-gray-600">
                    You acknowledge and agree to provide us with your bank details to transfer your service payments. The payments will be in Great British Pounds (GBP £). You will receive 90% of your service payments after deduction of 10% as our commission.
                  </p>
                </div>
              </div>
            </Section>

            {/* Cancellation and Refunds */}
            <Section title="Cancellation and Refunds">
              <p>
                You acknowledge and agree that any cancellations in part or full must be made within 72 hours of bookings/purchases completed. A cancellation fee will apply for all cancellations.
              </p>
              <p>
                After 24 hours outceedo.com considers the bookings as completely confirmed and will not accept any further cancellations. We reserve the right to charge purchaser a 100% cancellation fee.
              </p>
              <p>
                Any cancellations made by outceedo.com for any unforeseen circumstances, outceedo.com will refund the purchaser with a 100% payment refund. All refunds will be processed within 15 working days from the cancellation date.
              </p>
            </Section>

            {/* Indemnity */}
            <Section title="Indemnity">
              <div className="bg-red-50 rounded-xl p-4 border border-red-100 uppercase text-sm">
                <p className="text-gray-700">
                  YOU AGREE TO INDEMNIFY, DEFEND AND HOLD OUTCEEDO.COM, ITS PARENT COMPANIES, SUBSIDIARIES, OUR OFFICERS, DIRECTORS, SHAREHOLDERS, MANAGERS, EMPLOYEES, AFFILIATES AND AGENTS HARMLESS FROM AND AGAINST ALL ALLEGATIONS, LIABILITIES, ACTIONS, SUITS, LOSSES, DEMANDS, DAMAGES, FINES, PENALTIES, CLAIMS, OBLIGATIONS, SETTLEMENTS, JUDGEMENTS, COSTS AND EXPENSES ARISING OUT OF, RESULTING FROM, OR IN CONNECTION WITH THE SERVICES CONTEMPLATED BY THIS AGREEMENT AND ALSO RELATED TO YOUR BREACH OF THESE TERMS OF USE.
                </p>
              </div>
            </Section>

            {/* Arbitration */}
            <Section title="Arbitration">
              <p>
                Any dispute arising out of or in connection with this contract, including any question regarding its existence, validity or termination, shall be referred to and finally resolved by arbitration under the London Court of International Arbitration (LCIA) Rules.
              </p>
              <p>
                The number of arbitrators shall be one or three. The seat, or legal place, of arbitration shall be London, United Kingdom. The language to be used in the arbitral proceedings shall be English. The governing law of the contract shall be the substantive law of United Kingdom.
              </p>
            </Section>

            {/* Our Liability */}
            <Section title="Our Liability">
              <p>
                You acknowledge and agree that outceedo.com, its parent company and its subsidiaries will not be responsible for losses that were not caused by any breach on our part, any business loss, losses caused due to fans/followers ratings, losses caused due to bad content, losses due to changing fans/users/investors behaviour, losses due to non-availability of experts, losses due to your inability to use the service for any reason, any bugs, viruses, or similar, errors in website and/or mobile application functionality, and events beyond our reasonable control.
              </p>
            </Section>

            {/* Changes to Terms of Use */}
            <Section title="Changes to Terms of Use">
              <p>
                We reserve the right at our sole discretion to change, modify, add or remove any portion of these Terms of Use in whole or in part, at any time with or without a notice. You should look at these Terms of Use regularly. Your continued use or access to outceedo.com and its services after any such changes constitutes your acceptance of the new Terms of Use.
              </p>
            </Section>

            {/* Termination */}
            <Section title="Termination">
              <p>
                You may cancel your account at any time by emailing us at info@outceedo.com. Once your account is cancelled all your content will be immediately purged. We reserve the right to refuse service, terminate accounts, remove or edit content if you are in breach of applicable laws, these Terms of Use, or any other applicable terms and conditions, guidelines or policies.
              </p>
            </Section>

            {/* Contact Us */}
            <Section title="Contact Us">
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <p className="font-bold text-gray-900 mb-2">Outceedo Limited</p>
                <p>82 Berryden Gardens, Aberdeen,</p>
                <p>United Kingdom, AB25 3RW</p>
                <p className="mt-2">Registration No. SC853014</p>
                <p className="mt-2">
                  Web: <a href="https://outceedo.com" className="text-red-500 hover:underline font-bold">outceedo.com</a>
                </p>
                <p>
                  Email: <a href="mailto:info@outceedo.com" className="text-red-500 hover:underline font-bold">info@outceedo.com</a>
                </p>
              </div>
            </Section>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <div className="inline-flex items-center gap-3 bg-red-50 border-2 border-red-500 text-red-600 px-8 py-4 rounded-2xl text-lg font-black uppercase tracking-tight shadow-sm">
                <FileText className="w-6 h-6" />
                Thank you for reading our Terms of Use.
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}

export default Terms;
