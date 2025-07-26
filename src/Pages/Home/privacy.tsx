import OutceedoFooter from "./Footer";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";

function Privacy() {
  return (
    <div>
      <Navbar />
      <section className="bg-white min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-red-600 mb-6 text-center mt-6">
            Privacy & Cookie Policy
          </h1>
          <div className="bg-[#f7fafb] rounded-xl shadow-md p-8 mb-8 overflow-x-auto">
            {/* Introduction */}
            <section className="mb-8">
              <p className="text-lg text-gray-800 mb-4">
                Outceedo Limited (
                <a
                  href="https://outceedo.com"
                  className="text-red-500 hover:underline"
                >
                  outceedo.com
                </a>
                ), registered in Scotland, UK (Registration number SC853014),
                with the registered address at: 82 Berryden Gardens, Aberdeen,
                UK, AB25 3RW.
                <br />
                In this Privacy Policy "we", "us" and "our" means outceedo,
                outceedo.com outceedo limited, while references to “you” and
                “your” refer to the persons/users accessing and/or using this
                web or mobile app.
                <br />
                outceedo complies with and is registered under the data
                protection laws in the United Kingdom and takes all reasonable
                care to prevent any unauthorised access to your personal data.
                We protect and respect the privacy of every individual who
                visits our site and follow strict security procedures in the
                storage and disclosure of your information as required by law
                under the Data Protection Act 1998.
              </p>
              <p className="text-lg text-gray-800 mb-4">
                By using our website (
                <a
                  href="https://outceedo.com"
                  className="text-red-500 hover:underline"
                >
                  https://outceedo.com
                </a>
                ) and services you are giving us permission to use your data as
                set out in this Privacy Policy. If you do not agree to this
                Privacy Policy, please refrain from using our website or
                services.
              </p>
              <p className="text-lg text-gray-800 mb-4">
                This policy (together with our{" "}
                <Link to="/terms" className="text-red-500 hover:underline">
                  Terms of Use
                </Link>{" "}
                and any other documents referred to on it) sets out the basis on
                which any personal data we collect from you, or that you provide
                to us, will be processed by us. Please read the following
                carefully to understand our views and practices regarding your
                personal data and how we will treat it. By visiting{" "}
                <a
                  href="https://outceedo.com"
                  className="text-red-500 hover:underline"
                >
                  https://outceedo.com
                </a>{" "}
                you are accepting and consenting to the practices described in
                this policy.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-red-600 mb-3">
                Information We Collect From You
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">
                    Information you give us:
                  </span>{" "}
                  This is information about you that you give us by filling in
                  forms on our site [https://outceedo.com] or by corresponding
                  with us by phone, e-mail or otherwise. It includes information
                  you provide when you register to use our site,
                  register/subscribe to our service, search for a product, place
                  an order on our site, participate in discussion boards or
                  other social media functions on our site, enter a competition,
                  promotion or survey, or other activities commonly carried out
                  on the site and when you report a problem with our site. The
                  information you give us may include your name, address, e-mail
                  address and phone number, financial and credit card
                  information, personal description and photograph, any other
                  information.
                </li>
                <li>
                  <span className="font-semibold">
                    Information we collect about you:
                  </span>{" "}
                  With regard to each of your visits to our site we will
                  automatically collect the following information:
                  <ul className="list-disc pl-5">
                    <li>
                      technical information, including the Internet protocol
                      (IP) address used to connect your computer to the
                      Internet, your login information, browser type and
                      version, location, time zone setting, browser plug-in
                      types and versions, operating system and platform, other;
                    </li>
                    <li>
                      information about your visit, including the full Uniform
                      Resource Locators (URL), click stream to, through and from
                      our site (including date and time), products you viewed or
                      searched for, page response times, download errors, length
                      of visits to certain pages, page interaction information
                      (such as scrolling, clicks, and mouse-overs), methods used
                      to browse away from the page, other, and any phone number
                      used to call our customer service number.
                    </li>
                  </ul>
                </li>
                <li>
                  <span className="font-semibold">
                    Information we receive from other sources:
                  </span>{" "}
                  This is information we receive about you if you use any of the
                  other websites we operate or the other services we provide.
                  (In this case we will have informed you when we collected that
                  data if we intend to share those data internally and combine
                  it with data collected on this site. We will also have told
                  you for what purpose we will share and combine your data). We
                  are working closely with third parties (including, for
                  example, business partners, sub-contractors in technical,
                  payment and delivery services, advertising networks, analytics
                  providers, search information providers, credit reference
                  agencies). We will notify you when we receive information
                  about you from them and the purposes for which we intend to
                  use that information.
                </li>
                <li>
                  Information we receive about you if you use any of our social
                  media pages for review, like, share the information or any
                  other use.
                </li>
              </ul>
            </section>

            {/* Cookies Section */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-red-600 mb-3">
                Cookies, Web Beacons & Similar Technologies
              </h2>
              <p className="text-gray-700 text-base mb-2">
                Cookies are small data files that are sent to and stored on your
                computer, smartphone or other device for accessing the internet,
                whenever you visit a website. Cookies are useful because they
                allow a website to recognise a user's device.
              </p>
              <p className="text-gray-700 text-base mb-2">
                At outceedo.com, we use cookies for a variety of reasons, such
                as to determine preferences, let users navigate between pages
                efficiently, verify the user and carry out other essential
                security checks. Some of the functions that cookies perform can
                also be achieved using similar technologies. This policy refers
                to ‘cookies’ throughout, however it also covers these alternate
                mechanisms.
              </p>
              <p className="text-gray-700 text-base mb-2">
                The specific names and types of the cookies, web beacons, and
                other similar technologies we use may change from time to time.
                In order to help you better understand this Policy and our use
                of such technologies we have provided the following limited
                terminology and definitions:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  Cookies – tiny text files (typically made up of letters and
                  numbers) placed in the memory of your browser or device when
                  you visit a website or view a message. Cookies allow a website
                  to recognise a particular device or browser. There are several
                  types of cookies:
                  <ul className="list-disc pl-5">
                    <li>
                      Session cookies expire at the end of your browser session
                      and allow us to link your actions during that particular
                      browser session.
                    </li>
                    <li>
                      Persistent cookies are stored on your device in between
                      browser sessions, allowing us to remember your preferences
                      or actions across multiple sites.
                    </li>
                    <li>
                      First-party cookies are set by the site you are visiting.
                    </li>
                    <li>
                      Third-party cookies are set by a third party site separate
                      from the site you are visiting.
                    </li>
                  </ul>
                </li>
                <li>
                  Cookies can be disabled or removed by tools that are available
                  in most commercial browsers. The preferences for each browser
                  you use will need to be set separately and different browsers
                  offer different functionality and options.
                </li>
                <li>
                  Web beacons – Small graphic images (also known as "pixel tags"
                  or "clear GIFs") that may be included on our sites, services,
                  applications, messaging, and tools, that typically work in
                  conjunction with cookies to identify our users and user
                  behavior.
                </li>
                <li>
                  Similar technologies – Technologies that store information in
                  your browser or device utilising local shared objects or local
                  storage, such as flash cookies, HTML 5 cookies, and other web
                  application software methods. These technologies can operate
                  across all of your browsers, and in some instances may not be
                  fully managed by your browser and may require management
                  directly through your installed applications or device. We do
                  not use these technologies for storing information to target
                  advertising to you on or off our sites.
                </li>
              </ul>
              <p className="text-gray-700 text-base mb-2">
                We may use the terms "cookies" or "similar technologies"
                interchangeably in our policies to refer to all technologies
                that we may use to store data in your browser or device or that
                collect information or help us identify you in the manner
                described above.
              </p>
            </section>

            {/* Uses Made of the Information */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-red-600 mb-3">
                Uses Made of the Information
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">
                    Information you give to us:
                  </span>{" "}
                  We will use this information:
                  <ul className="list-disc pl-5">
                    <li>
                      to carry out our obligations arising from any contracts
                      entered into between you and us and to provide you with
                      the information, products and services that you request
                      from us;
                    </li>
                    <li>
                      to provide you with information about other services we
                      offer that are similar to those that you have already
                      purchased or enquired about;
                    </li>
                    <li>
                      to provide you, with information of football players,
                      experts, other users, etc that we feel may interest you.
                      If you are an existing customer/user, we will only contact
                      you by electronic means (e-mail, SMS or social media) with
                      the said information. If you are a new customer/user, and
                      agreed to Terms of Use where you gave us your consent to
                      use your data, we will contact you by electronic means
                      only in this case. If you do not want us to use your data
                      in this way for marketing purposes, please let us know by
                      email, SMS, Phone Call, Click on the ‘unsubscribe’ link
                      provided on each email we send to you or please tick the
                      relevant opt out box situated on the form on which we
                      collect your data (the [order form OR registration form]);
                    </li>
                    <li>to notify you about changes to our service;</li>
                    <li>
                      to ensure that content from our site is presented in the
                      most effective manner for you and for your computer.
                    </li>
                  </ul>
                  Please remember that by opting out, we will not be able to
                  contact you about products or services that may benefit you.
                  As we don't want you to be inundated with marketing mail from
                  the providers/partners, wherever possible our technology will
                  automatically opt you out of receiving their marketing
                  material. You should therefore not receive any communication
                  from any third parties, other than outlined in this Privacy
                  Policy. Although we cannot guarantee this, we do have
                  contractual arrangements in place to prevent such
                  communication, so please let us know if you do experience
                  problems other than outlined above by emailing
                  info@outceedo.com If you click through to any third-party
                  website, we cannot guarantee you will not be contacted by
                  them. We would recommend that you read their terms and
                  conditions and their privacy policy concerning your right to
                  opt-out from contact by them.
                </li>
                <li>
                  <span className="font-semibold">
                    Information we collect about you:
                  </span>{" "}
                  We will use this information:
                  <ul className="list-disc pl-5">
                    <li>
                      to administer our site and for internal operations,
                      including troubleshooting, data analysis, testing,
                      research, statistical and survey purposes;
                    </li>
                    <li>
                      to improve our site to ensure that content is presented in
                      the most effective manner for you and for your computer;
                    </li>
                    <li>
                      to allow you to participate in interactive features of our
                      service, when you choose to do so;
                    </li>
                    <li>
                      as part of our efforts to keep our site safe and secure;
                    </li>
                    <li>
                      to measure or understand the effectiveness of advertising
                      we serve to you and others, and to deliver relevant
                      advertising to you;
                    </li>
                    <li>
                      to make suggestions and recommendations to you and other
                      users of our site about goods or services that may
                      interest you or them.
                    </li>
                  </ul>
                </li>
                <li>
                  <span className="font-semibold">
                    Information we receive from other sources:
                  </span>{" "}
                  We will combine this information with information you give to
                  us and information we collect about you. We will use this
                  information and the combined information for the purposes set
                  out above (depending on the types of information we receive).
                </li>
              </ul>
            </section>

            {/* Disclosure of Your Information */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-red-600 mb-3">
                Disclosure of Your Information
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  You agree that we have the right to share your personal
                  information with:
                  <ul className="list-disc pl-5">
                    <li>
                      Any member of our group, which means our subsidiaries, our
                      ultimate holding company and its subsidiaries, as defined
                      in section 1159 of the UK Companies Act 2006.
                    </li>
                    <li>
                      Selected third parties including:
                      <ul className="list-disc pl-5">
                        <li>
                          business partners, suppliers and sub-contractors for
                          the performance of any contract we enter into with
                          them or you;
                        </li>
                        <li>
                          advertisers and advertising networks that require the
                          data to select and serve relevant adverts to you and
                          others. We do not disclose information about
                          identifiable individuals to our advertisers, but we
                          will provide them with aggregate information about our
                          users (for example, we may inform them that 500 men
                          aged under 30 have clicked on their advertisement on
                          any given day). We may also use such aggregate
                          information to help advertisers reach the kind of
                          audience they want to target (for example, women in
                          SW1). We may make use of the personal data we have
                          collected from you to enable us to comply with our
                          advertisers' wishes by displaying their advertisement
                          to that target audience;
                        </li>
                        <li>
                          analytics and search engine providers that assist us
                          in the improvement and optimisation of our site;
                        </li>
                        <li>
                          credit reference agencies for the purpose of assessing
                          your credit score where this is a condition of us
                          entering into a contract with you.
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  We will disclose your personal information to third parties:
                  <ul className="list-disc pl-5">
                    <li>
                      In the event that we sell or buy any business or assets,
                      in which case we will disclose your personal data to the
                      prospective seller or buyer of such business or assets.
                    </li>
                    <li>
                      If moovicart.com or substantially all of its assets are
                      acquired by a third party, in which case personal data
                      held by it about its customers will be one of the
                      transferred assets.
                    </li>
                    <li>
                      If we are under a duty to disclose or share your personal
                      data in order to comply with any legal obligation, or in
                      order to enforce or apply our{" "}
                      <Link
                        to="/terms"
                        className="text-red-500 hover:underline"
                      >
                        terms of use
                      </Link>{" "}
                      and other agreements; or to protect the rights, property,
                      or safety of moovicart.com/SSIL, our customers, or others.
                      This includes exchanging information with other companies
                      and organisations for the purposes of fraud protection and
                      credit risk reduction.
                    </li>
                  </ul>
                </li>
              </ul>
            </section>

            {/* Where We Store Your Personal Data */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-red-600 mb-3">
                Where We Store Your Personal Data
              </h2>
              <p className="text-gray-700 text-base mb-2">
                The data that we collect from you will be transferred to, and
                stored at, a destination outside the European Economic Area
                ("EEA"). It will also be processed by staff operating outside
                the EEA who works for us or for one of our suppliers. This
                includes staff engaged in, among other things, the fulfilment of
                your order, the processing of your payment details and the
                provision of support services. By submitting your personal data,
                you agree to this transfer, storing or processing.
                Moovicart.com/SSIL OR [We will take all steps reasonably
                necessary to ensure that your data is treated securely and in
                accordance with this privacy policy.]
              </p>
              <p className="text-gray-700 text-base mb-2">
                All information you provide to us is stored on our secure
                servers. Any payment transactions will be encrypted using SSL
                technology. Where we have given you (or where you have chosen) a
                password which enables you to access certain parts of our site,
                you are responsible for keeping this password confidential. We
                ask you not to share a password with anyone.
              </p>
              <p className="text-gray-700 text-base mb-2">
                Unfortunately, the transmission of information via the internet
                is not completely secure. Although we will do our best to
                protect your personal data, we cannot guarantee the security of
                your data transmitted to our site; any transmission is at your
                own risk. Once we have received your information, we will use
                strict procedures and security features to try to prevent
                unauthorised access.
              </p>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-red-600 mb-3">
                Your Rights
              </h2>
              <p>
                You have the right to ask us not to process your personal data
                for marketing purposes. We will usually inform you (with an
                option of opt out and/or unsubscribe) if we intend to use your
                data for such purposes or if we intend to disclose your
                information to any third party for such purposes. You can
                exercise your right to prevent such processing by checking
                certain boxes on the forms we use to collect your data or You
                can also exercise the right at any time by contacting us at 82
                Berryden Gardens, Aberdeen, UK, AB25 3RW OR info@outceedo.com.
              </p>
              <p>
                Our site may, from time to time, contain links to and from the
                websites of our partner networks, advertisers and affiliates. If
                you follow a link to any of these websites, please note that
                these websites have their own privacy policies and that we do
                not accept any responsibility or liability for these policies.
                Please check these policies before you submit any personal data
                to these websites.
              </p>
              <p>
                <b>Access to Information:</b> The Act gives you the right to
                access information held about you. Your right of access can be
                exercised in accordance with the Act. Any premium access request
                (players) will be subject to a fee of £10 to meet our costs in
                providing you with details of the information we hold about you.
              </p>
            </section>

            {/* Confidentiality */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-red-600 mb-3">
                Confidentiality
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  That your User ID and Password must be kept confidential at
                  all times.
                </li>
                <li>
                  That your Passwords should never be shared or exposed to
                  others.
                </li>
                <li>
                  That you shall be solely responsible for maintaining the
                  confidentiality of your User Id and password
                </li>
                <li>
                  That you will not let anyone else access your account or do
                  anything else that might jeopardize the security of your
                  account.
                </li>
                <li>
                  That you are responsible for the confidentiality and use of
                  all IDs, passwords, security data, methods and devices
                  provided in connection with our Web Site.
                </li>
                <li>
                  That you will be solely responsible for the use of any data,
                  information obtained, and all transaction requests
                  electronically transmitted by any person using your IDs and
                  other security data.
                </li>
                <li>
                  That you shall not use a false name or email address owned or
                  controlled by another person.
                </li>
                <li>
                  That you will update your registration information which
                  remains true, correct and complete.
                </li>
                <li>
                  That you will conduct yourself in a professional manner in all
                  your interactions with moovicart.com and its employees.
                </li>
                <li>
                  By agreeing to this Agreement, you expressly acknowledge and
                  agree that use of the Web Site is at your sole risk. You agree
                  that moovicart.com and its subsidiaries are not responsible
                  for evaluating the risks associated with the use of the
                  website.
                </li>
              </ul>
            </section>

            {/* Changes to Privacy Policy */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-red-600 mb-3">
                Changes to Our Privacy Policy
              </h2>
              <p className="text-gray-700 text-base mb-2">
                Any changes we make to our privacy policy in the future will be
                posted on this page and, where appropriate, notified to you by
                e-mail. Please check back frequently to see any updates or
                changes to our privacy policy.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-red-600 mb-3">
                Contact
              </h2>
              <p className="text-gray-700 text-base mb-1">
                Questions, comments and requests regarding this privacy policy
                are welcomed and should be addressed to:
                <br />
                <span className="font-semibold">
                  82 Berryden Gardens, Aberdeen, UK, AB25 3RW
                </span>
                <br />
                Email:{" "}
                <a
                  href="mailto:info@outceedo.com"
                  className="text-red-500 hover:underline"
                >
                  info@outceedo.com
                </a>
              </p>
            </section>

            <div className="mt-12 text-center">
              <span className="inline-block bg-red-100 text-red-600 px-6 py-3 rounded-full text-lg font-semibold shadow">
                Thank you for trusting Outceedo with your privacy.
              </span>
            </div>
          </div>
        </div>
      </section>
      <OutceedoFooter />
    </div>
  );
}

export default Privacy;
