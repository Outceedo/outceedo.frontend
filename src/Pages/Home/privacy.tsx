import { motion } from "motion/react";
import { Shield, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
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

function Privacy() {
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
              PRIVACY & <span className="text-red-500">COOKIE POLICY</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-3 bg-gray-50 border border-gray-100 px-6 py-3 rounded-2xl"
            >
              <Shield className="w-5 h-5 text-red-500" />
              <span className="text-gray-600 font-medium">Your privacy matters to us</span>
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
                Outceedo Limited (<a href="https://outceedo.com" className="text-red-500 hover:underline font-bold">outceedo.com</a>), registered in Scotland, UK (Registration number SC853014), with the registered address at: 82 Berryden Gardens, Aberdeen, UK, AB25 3RW.
              </p>
              <p>
                In this Privacy Policy "we", "us" and "our" means outceedo, outceedo.com outceedo limited, while references to "you" and "your" refer to the persons/users accessing and/or using this web or mobile app.
              </p>
              <p>
                outceedo complies with and is registered under the data protection laws in the United Kingdom and takes all reasonable care to prevent any unauthorised access to your personal data. We protect and respect the privacy of every individual who visits our site and follow strict security procedures in the storage and disclosure of your information as required by law under the Data Protection Act 1998.
              </p>
              <p>
                By using our website (<a href="https://outceedo.com" className="text-red-500 hover:underline font-bold">https://outceedo.com</a>) and services you are giving us permission to use your data as set out in this Privacy Policy. If you do not agree to this Privacy Policy, please refrain from using our website or services.
              </p>
              <p>
                This policy (together with our <Link to="/terms" className="text-red-500 hover:underline font-bold">Terms of Use</Link> and any other documents referred to on it) sets out the basis on which any personal data we collect from you, or that you provide to us, will be processed by us. Please read the following carefully to understand our views and practices regarding your personal data and how we will treat it. By visiting <a href="https://outceedo.com" className="text-red-500 hover:underline font-bold">https://outceedo.com</a> you are accepting and consenting to the practices described in this policy.
              </p>
            </Section>

            {/* Information We Collect */}
            <Section title="Information We Collect From You">
              <ul className="list-none space-y-4">
                <li className="bg-white rounded-xl p-4 border border-gray-100">
                  <span className="font-bold text-gray-900">Information you give us:</span> This is information about you that you give us by filling in forms on our site [https://outceedo.com] or by corresponding with us by phone, e-mail or otherwise. It includes information you provide when you register to use our site, register/subscribe to our service, search for a product, place an order on our site, participate in discussion boards or other social media functions on our site, enter a competition, promotion or survey, or other activities commonly carried out on the site and when you report a problem with our site. The information you give us may include your name, address, e-mail address and phone number, financial and credit card information, personal description and photograph, any other information.
                </li>
                <li className="bg-white rounded-xl p-4 border border-gray-100">
                  <span className="font-bold text-gray-900">Information we collect about you:</span> With regard to each of your visits to our site we will automatically collect the following information:
                  <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-500">
                    <li>technical information, including the Internet protocol (IP) address used to connect your computer to the Internet, your login information, browser type and version, location, time zone setting, browser plug-in types and versions, operating system and platform, other;</li>
                    <li>information about your visit, including the full Uniform Resource Locators (URL), click stream to, through and from our site (including date and time), products you viewed or searched for, page response times, download errors, length of visits to certain pages, page interaction information (such as scrolling, clicks, and mouse-overs), methods used to browse away from the page, other, and any phone number used to call our customer service number.</li>
                  </ul>
                </li>
                <li className="bg-white rounded-xl p-4 border border-gray-100">
                  <span className="font-bold text-gray-900">Information we receive from other sources:</span> This is information we receive about you if you use any of the other websites we operate or the other services we provide. We are working closely with third parties (including, for example, business partners, sub-contractors in technical, payment and delivery services, advertising networks, analytics providers, search information providers, credit reference agencies). We will notify you when we receive information about you from them and the purposes for which we intend to use that information.
                </li>
                <li className="bg-white rounded-xl p-4 border border-gray-100">
                  Information we receive about you if you use any of our social media pages for review, like, share the information or any other use.
                </li>
              </ul>
            </Section>

            {/* Cookies Section */}
            <Section title="Cookies, Web Beacons & Similar Technologies">
              <p>
                Cookies are small data files that are sent to and stored on your computer, smartphone or other device for accessing the internet, whenever you visit a website. Cookies are useful because they allow a website to recognise a user's device.
              </p>
              <p>
                At outceedo.com, we use cookies for a variety of reasons, such as to determine preferences, let users navigate between pages efficiently, verify the user and carry out other essential security checks. Some of the functions that cookies perform can also be achieved using similar technologies. This policy refers to 'cookies' throughout, however it also covers these alternate mechanisms.
              </p>
              <p>
                The specific names and types of the cookies, web beacons, and other similar technologies we use may change from time to time. In order to help you better understand this Policy and our use of such technologies we have provided the following limited terminology and definitions:
              </p>
              <ul className="list-none space-y-3">
                <li className="bg-white rounded-xl p-4 border border-gray-100">
                  <span className="font-bold text-gray-900">Cookies</span> - tiny text files (typically made up of letters and numbers) placed in the memory of your browser or device when you visit a website or view a message. There are several types:
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-500">
                    <li>Session cookies expire at the end of your browser session</li>
                    <li>Persistent cookies are stored on your device in between browser sessions</li>
                    <li>First-party cookies are set by the site you are visiting</li>
                    <li>Third-party cookies are set by a third party site separate from the site you are visiting</li>
                  </ul>
                </li>
                <li className="bg-white rounded-xl p-4 border border-gray-100">
                  <span className="font-bold text-gray-900">Web beacons</span> - Small graphic images (also known as "pixel tags" or "clear GIFs") that may be included on our sites, services, applications, messaging, and tools, that typically work in conjunction with cookies to identify our users and user behavior.
                </li>
                <li className="bg-white rounded-xl p-4 border border-gray-100">
                  <span className="font-bold text-gray-900">Similar technologies</span> - Technologies that store information in your browser or device utilising local shared objects or local storage, such as flash cookies, HTML 5 cookies, and other web application software methods.
                </li>
              </ul>
              <p>
                Cookies can be disabled or removed by tools that are available in most commercial browsers. The preferences for each browser you use will need to be set separately and different browsers offer different functionality and options.
              </p>
            </Section>

            {/* Uses Made of the Information */}
            <Section title="Uses Made of the Information">
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <span className="font-bold text-gray-900">Information you give to us:</span> We will use this information:
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-500">
                    <li>to carry out our obligations arising from any contracts entered into between you and us and to provide you with the information, products and services that you request from us;</li>
                    <li>to provide you with information about other services we offer that are similar to those that you have already purchased or enquired about;</li>
                    <li>to provide you with information of football players, experts, other users, etc that we feel may interest you;</li>
                    <li>to notify you about changes to our service;</li>
                    <li>to ensure that content from our site is presented in the most effective manner for you and for your computer.</li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <span className="font-bold text-gray-900">Information we collect about you:</span> We will use this information:
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-500">
                    <li>to administer our site and for internal operations, including troubleshooting, data analysis, testing, research, statistical and survey purposes;</li>
                    <li>to improve our site to ensure that content is presented in the most effective manner for you and for your computer;</li>
                    <li>to allow you to participate in interactive features of our service, when you choose to do so;</li>
                    <li>as part of our efforts to keep our site safe and secure;</li>
                    <li>to measure or understand the effectiveness of advertising we serve to you and others, and to deliver relevant advertising to you;</li>
                    <li>to make suggestions and recommendations to you and other users of our site about goods or services that may interest you or them.</li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <span className="font-bold text-gray-900">Information we receive from other sources:</span> We will combine this information with information you give to us and information we collect about you. We will use this information and the combined information for the purposes set out above (depending on the types of information we receive).
                </div>
              </div>
            </Section>

            {/* Disclosure of Your Information */}
            <Section title="Disclosure of Your Information">
              <p>You agree that we have the right to share your personal information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Any member of our group, which means our subsidiaries, our ultimate holding company and its subsidiaries, as defined in section 1159 of the UK Companies Act 2006.</li>
                <li>Selected third parties including business partners, suppliers and sub-contractors for the performance of any contract we enter into with them or you.</li>
                <li>Advertisers and advertising networks that require the data to select and serve relevant adverts to you and others.</li>
                <li>Analytics and search engine providers that assist us in the improvement and optimisation of our site.</li>
                <li>Credit reference agencies for the purpose of assessing your credit score where this is a condition of us entering into a contract with you.</li>
              </ul>
              <p>We will disclose your personal information to third parties:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>In the event that we sell or buy any business or assets.</li>
                <li>If Outceedo Limited or substantially all of its assets are acquired by a third party.</li>
                <li>If we are under a duty to disclose or share your personal data in order to comply with any legal obligation, or in order to enforce or apply our <Link to="/terms" className="text-red-500 hover:underline font-bold">terms of use</Link> and other agreements; or to protect the rights, property, or safety of Outceedo, our customers, or others.</li>
              </ul>
            </Section>

            {/* Where We Store Your Personal Data */}
            <Section title="Where We Store Your Personal Data">
              <p>
                The data that we collect from you will be transferred to, and stored at, a destination outside the European Economic Area ("EEA"). It will also be processed by staff operating outside the EEA who works for us or for one of our suppliers. By submitting your personal data, you agree to this transfer, storing or processing. We will take all steps reasonably necessary to ensure that your data is treated securely and in accordance with this privacy policy.
              </p>
              <p>
                All information you provide to us is stored on our secure servers. Any payment transactions will be encrypted using SSL technology. Where we have given you (or where you have chosen) a password which enables you to access certain parts of our site, you are responsible for keeping this password confidential. We ask you not to share a password with anyone.
              </p>
              <p>
                Unfortunately, the transmission of information via the internet is not completely secure. Although we will do our best to protect your personal data, we cannot guarantee the security of your data transmitted to our site; any transmission is at your own risk. Once we have received your information, we will use strict procedures and security features to try to prevent unauthorised access.
              </p>
            </Section>

            {/* Your Rights */}
            <Section title="Your Rights">
              <p>
                You have the right to ask us not to process your personal data for marketing purposes. We will usually inform you (with an option of opt out and/or unsubscribe) if we intend to use your data for such purposes or if we intend to disclose your information to any third party for such purposes. You can exercise your right to prevent such processing by checking certain boxes on the forms we use to collect your data or you can also exercise the right at any time by contacting us at 82 Berryden Gardens, Aberdeen, UK, AB25 3RW OR info@outceedo.com.
              </p>
              <p>
                Our site may, from time to time, contain links to and from the websites of our partner networks, advertisers and affiliates. If you follow a link to any of these websites, please note that these websites have their own privacy policies and that we do not accept any responsibility or liability for these policies. Please check these policies before you submit any personal data to these websites.
              </p>
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <span className="font-bold text-red-600">Access to Information:</span> The Act gives you the right to access information held about you. Your right of access can be exercised in accordance with the Act. Any premium access request (players) will be subject to a fee of £10 to meet our costs in providing you with details of the information we hold about you.
              </div>
            </Section>

            {/* Confidentiality */}
            <Section title="Confidentiality">
              <ul className="list-disc pl-6 space-y-2">
                <li>That your User ID and Password must be kept confidential at all times.</li>
                <li>That your Passwords should never be shared or exposed to others.</li>
                <li>That you shall be solely responsible for maintaining the confidentiality of your User Id and password.</li>
                <li>That you will not let anyone else access your account or do anything else that might jeopardize the security of your account.</li>
                <li>That you are responsible for the confidentiality and use of all IDs, passwords, security data, methods and devices provided in connection with our Web Site.</li>
                <li>That you will be solely responsible for the use of any data, information obtained, and all transaction requests electronically transmitted by any person using your IDs and other security data.</li>
                <li>That you shall not use a false name or email address owned or controlled by another person.</li>
                <li>That you will update your registration information which remains true, correct and complete.</li>
                <li>That you will conduct yourself in a professional manner in all your interactions with Outceedo and its employees.</li>
                <li>By agreeing to this Agreement, you expressly acknowledge and agree that use of the Web Site is at your sole risk. You agree that Outceedo and its subsidiaries are not responsible for evaluating the risks associated with the use of the website.</li>
              </ul>
            </Section>

            {/* Changes to Privacy Policy */}
            <Section title="Changes to Our Privacy Policy">
              <p>
                Any changes we make to our privacy policy in the future will be posted on this page and, where appropriate, notified to you by e-mail. Please check back frequently to see any updates or changes to our privacy policy.
              </p>
            </Section>

            {/* Contact */}
            <Section title="Contact">
              <p>
                Questions, comments and requests regarding this privacy policy are welcomed and should be addressed to:
              </p>
              <div className="bg-white rounded-xl p-6 border border-gray-100 mt-4">
                <p className="font-bold text-gray-900 mb-2">82 Berryden Gardens, Aberdeen, UK, AB25 3RW</p>
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
                <Shield className="w-6 h-6" />
                Thank you for trusting Outceedo with your privacy.
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}

export default Privacy;
