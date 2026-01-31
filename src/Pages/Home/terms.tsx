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
              <span className="text-gray-600 font-medium">
                Please read these terms carefully
              </span>
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
                Welcome to Outceedo, please read these Terms of Use carefully
                before using outceedo.com and its services. These Terms of Use
                ("Terms") apply to your access to, and use of the website and
                other online products and services (collectively, our
                "Services") provided by Outceedo Ltd.
              </p>
              <p>
                For the purpose of these Terms of Use "we", "us" and "our" means
                outceedo, outceedo.com, The Company and/or Outceedo Limited,
                while references to "You" and "Your" refer to the individuals,
                companies or users accessing and/or using our website/mobile
                app/services.
              </p>
              <p>
                By accessing or using our Website, Mobile App or Services, you
                agree to comply with and be legally bound by these Terms of Use
                ("Terms or Agreement"). And you are entering into a legally
                binding agreement with outceedo.com and/or Outceedo Limited (its
                parent company) whether or not you become a registered user of
                our Website/mobile app/Services. We offer a wide range of
                services and sometimes additional terms may apply. When you use
                outceedo.com and its services, you will also be subjected to the
                terms and conditions, guidelines and privacy policy applicable
                to that outceedo.com services ("Service Terms"). If you do not:
                a) read, b) fully understand and c) agree to these Terms of Use,
                you must immediately leave the Website and avoid/discontinue the
                use of our Website/App/Services.
              </p>
              <p>
                If you are accessing or using our Services on behalf of another
                person or entity, you represent and warrant that you are
                authorised to accept these Terms on such person or entity's
                behalf, and that such person or entity will be responsible to
                outceedo if you violate these Terms.
              </p>
            </Section>

            {/* Who We Are */}
            <Section title="Who We Are">
              <p>
                Outceedo is an Online Marketplace (b2c eCommerce website) that
                connects worldwide sports experts and aspiring sports players.
              </p>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <p className="font-bold text-gray-900">Outceedo.com</p>
                <p>
                  Registered in Scotland, United Kingdom (Registration number
                  SC853014)
                </p>
                <p>
                  Registered address: 82 Berryden Gardens, Aberdeen, United
                  Kingdom, AB25 3RW
                </p>
              </div>
            </Section>

            {/* Our Platform */}
            <Section title="Our Platform">
              <p>
                Outceedo is an Online Marketplace (b2c eCommerce website) that
                connects worldwide sports experts and aspiring sports players.
              </p>
              <p>
                We serve worldwide sports experts, aspiring sports players,
                sports related clubs, academies, companies, organisations,
                audience/fans/followers, sports media companies, sports sponsors
                with an online marketplace and many other services.
              </p>
            </Section>

            {/* User Types and Our Services */}
            <Section title="User Types and Our Services">
              <p className="font-bold text-gray-900 mb-3">
                Users: Players, Sports Experts, Sports Teams, Sports Sponsors,
                Fans/Followers
              </p>
              <ul className="list-none space-y-3">
                <li className="bg-white rounded-xl p-4 border border-gray-100">
                  A Platform/Online Marketplace that allows Sports Experts to
                  create their profile, add personal details, photos, videos,
                  certificates, awards, social media links and offer various
                  services to worldwide Sports Players.
                </li>
                <li className="bg-white rounded-xl p-4 border border-gray-100">
                  A Platform/Online Marketplace that allows Sports Players to
                  create their profile, add personal details, photos, videos,
                  certificates, awards, social media links and book worldwide
                  services provided by Sports Experts, Apply Sponsorships from
                  Sponsors.
                </li>
                <li className="bg-white rounded-xl p-4 border border-gray-100">
                  A Platform that allows Sports Teams to create their profile,
                  add personal details, photos, videos, certificates, awards,
                  social media links and Apply Sponsorships from Sponsors.
                </li>
                <li className="bg-white rounded-xl p-4 border border-gray-100">
                  A Platform that allows Sports Sponsors to create their
                  profile, add personal details, photos, videos, social media
                  links and Accept/Approve Sponsorships Applications.
                </li>
                <li className="bg-white rounded-xl p-4 border border-gray-100">
                  A Platform that allows worldwide audience/fans/followers an
                  opportunity to See/Rate/Like/Share/Write Reviews on
                  information, photos & videos of sport experts and sports
                  players.
                </li>
              </ul>
            </Section>

            {/* User Eligibility */}
            <Section title="User Eligibility">
              <p>
                Our Services are available only to individuals and companies
                that can form legally binding contracts under applicable law.
                The Website/Online Platform, mobile app and Services are
                intended solely and strictly for Individuals/Users who are 18
                years of age or older. Any access to or use of the website,
                mobile App or Services by anyone under 18 years of age is
                strictly prohibited. By accessing or using the website, mobile
                app or services you represent and agree that you are 18 years of
                age or older.
              </p>
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <span className="font-bold text-red-600">For Minors:</span> If
                the player is a minor then it must be a responsibility of the
                parents or legal guardians to create, upload, update and
                maintain the account on behalf of minors. All the activities
                performing in the website must be done by parents or Legal
                Guardians of that minor player.
              </div>
            </Section>

            {/* Users Obligation/Responsibility */}
            <Section title="Users Obligation/Responsibility">
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h4 className="font-black text-gray-900 uppercase tracking-tight mb-4">
                    You Should:
                  </h4>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>be aged 18 years or older</li>
                    <li>register your account on the website/mobile app</li>
                    <li>
                      fill the personal profile with complete and accurate
                      personal details
                    </li>
                    <li>
                      fill the company details and submit company registration
                      certificate
                    </li>
                    <li>
                      provide a complete and accurate photos, videos,
                      data/information, etc
                    </li>
                    <li>
                      provide training, experience, PGV, Disclosure
                      Documents/certificates
                    </li>
                    <li>maintain confidentiality with your login details</li>
                    <li>pay appropriate subscription Fee, taxes, etc</li>
                    <li>
                      provide services which you advertise in our platform
                    </li>
                    <li>
                      have ownership on intellectual property or other material
                      provided by you for display, advertise in outceedo.com
                    </li>
                    <li>
                      provide relevant documents requested by us for security
                      reasons
                    </li>
                    <li>agree that the content provided is for intended use</li>
                    <li>
                      agree to all relevant policies (terms of use, terms &
                      conditions, privacy policy, etc)
                    </li>
                    <li>
                      agree for ceasing of your account without notice, if you
                      are not complying with our policies and identified as
                      fraud.
                    </li>
                  </ul>
                </div>
                <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                  <h4 className="font-black text-red-600 uppercase tracking-tight mb-4">
                    You Should Not:
                  </h4>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>
                      use our website, mobile app and services if you are not
                      above 18 years of age
                    </li>
                    <li>
                      upload contents that is inappropriate to the
                      public/people/users
                    </li>
                    <li>
                      upload false, offensive, illegal, harassing, tortuous,
                      harmful, abusive, lewd, obscene, inaccurate, pornographic,
                      misleading, threatening, defamatory or libellous content
                    </li>
                    <li>
                      uploading the content that infringe the copyright,
                      trademark or other rights of third parties.
                    </li>
                    <li>
                      interfere or manipulate with any other user accounts or
                      materials;
                    </li>
                    <li>
                      transfer your account details and user ID to another party
                      without our consent;
                    </li>
                    <li>
                      distribute viruses or any other technologies that may harm
                      outceedo.com and its services
                    </li>
                    <li>
                      use any robot, spider, scraper or other automated means to
                      access our services for any purpose.
                    </li>
                    <li>
                      bypass our robot exclusion headers, interfere with the
                      working of our Services or impose an unreasonable or
                      disproportionately large load on our infrastructure.
                    </li>
                    <li>
                      commercialise any outceedo.com application, service, any
                      information or software associated with such application;
                    </li>
                    <li>
                      collect information about users such as personal data,
                      privacy data, phone numbers, addresses, email addresses
                      without our consent
                    </li>
                    <li>
                      circumvent any technical measures we use to provide the
                      Services.
                    </li>
                    <li>fail to pay for services</li>
                  </ul>
                </div>
                <p>
                  If you are a sports expert offering services to the players
                  including minor players, you represent and warrant that you
                  have the permission of the parent or legal guardian of all
                  minor players. You represent and warrant that you (i) have
                  never been the subject of a complaint, restraining order, or
                  any other legal action involving criminal activity or alleged
                  criminal activity, and you have not been arrested for, charged
                  with, or convicted of any crime, or any criminal offence
                  involving violence, abuse, neglect, fraud or larceny, or any
                  offence that involves endangering the safety of others, and
                  (ii) have not been and are not currently required to register
                  as a sex offender with any government entity. Individuals who
                  have been involved with activities described in "(i)" or
                  "(ii)" above are NOT eligible to participate in our Services
                  or to be or become Members.
                </p>
              </div>
            </Section>

            {/* Parent/Guardian Agreement */}
            <Section title="Parent/Guardian Agreement">
              <p>
                If a player is a minor (below 18 years of age) then, ONLY a
                parent or legal guardian must create, access and maintain their
                profile in our website/mobile app. As a parent or legal guardian
                of a Minor Player, you acknowledge and represent to Outceedo
                that you have the right and authority to make decisions on
                behalf of the child concerning the care, custody and control of
                each Minor Player, including but not limited to the right and
                authority to execute this Agreement on behalf of the Minor
                Player. By signing this Agreement, you are binding each of your
                Minor Player(s) to its terms, including but not limited to the
                ASSUMPTION OF RISK, WAIVER OF LIABILITY, DEFENSE AND
                INDEMNIFICATION. ARBITRATION AGREEMENT WITHCLASS ACTION WAIVER
                and HEALTH AND SAFETY provisions. For Minor Players seventeen
                (17) years old and younger, parents are strictly prohibited from
                leaving the minor while the Minor player is participating in
                activities online and offline.
              </p>
              <p>
                You agree that you have the right, authority and capacity to
                enter into this legal agreement on your own behalf and on behalf
                of your employer/company/club/team/, another individual or any
                entity for which you are acting as representative and to abide
                by all the terms of use contained herein. By clicking "Register"
                you agree & acknowledge that you have read and understood the
                terms and conditions of this "Terms of Use". You also agree to
                be legally bound by giving your consent to use electronic
                signatures and that you acknowledge your click of the "Register"
                button as one such signature.
              </p>
            </Section>

            {/* Confidentiality */}
            <Section title="Confidentiality">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  That your User ID and Password must be kept confidential at
                  all times.
                </li>
                <li>
                  That your Password/s should never be shared or exposed to
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
                  provided in connection with our Web Site/App.
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
                  That you will update your registration information, personal
                  profile, company profile which remains true, accurate, correct
                  and complete.
                </li>
                <li>
                  That you will conduct yourself in a professional manner in all
                  your interactions with outceedo.com and its employees.
                </li>
                <li>
                  By agreeing to this Agreement, you expressly acknowledge and
                  agree that use of the Web Site/App is at your sole risk. You
                  agree that outceedo.com and its subsidiaries are not
                  responsible for evaluating the risks associated with the use
                  of the website/App.
                </li>
              </ul>
            </Section>

            {/* Privacy */}
            <Section title="Privacy">
              <p>
                Please review our Privacy & Cookie Policy which also governs
                your use of outceedo.com & its Services and to understand our
                practices.
              </p>
            </Section>

            {/* Copyrights, Trademarks and Intellectual Property */}
            <Section title="Copyrights, Trademarks and Intellectual Property">
              <p>
                All content included in or made available through outceedo.com
                and its subsidiaries, such as concepts, workflows, layouts, data
                bases, illustrations, codes, flash presentations, plug ins,
                text, designs, graphics, logos, button icons, images, digital
                data and data compilations, software, applications, delivery
                mechanisms, configurations are the properties of outceedo.com
                and is governed by the Copyright, Designs and Patents Act 1988
                (the 1988 Act)
              </p>
              <p>
                In addition to illustrations, scripts, graphics, logos, page
                headers, button icons, and service names included in or made
                available through any outceedo.com services are trademarks and
                service marks of outceedo.com. The trademarks, service marks and
                trade dress of outceedo.com may not be used or reproduced
                without prior written approval from outceedo.com and may not be
                used in connection with any product or service that is not
                affiliated with outceedo.com i) in any manner that is likely to
                cause confusion among customers, ii) in any manner that
                disparages or discredits outceedo.com. Other trademarks that
                appear on our website and user interfaces are the property of
                the respective owners, who may or may not be affiliated with,
                connected to, or sponsored by outceedo.com.
              </p>
            </Section>

            {/* Content */}
            <Section title="Content">
              <p>
                You acknowledge and agree by posting, uploading, submitting or
                otherwise making available the content (marketing material for
                any services) using our website/mobile-app/service, via email or
                anyone means or method; you hereby agree and grant us a
                non-exclusive, worldwide, fully paid up, perpetual, irrevocable,
                royalty-free, license to use, promotional, publicity, display,
                publish, advertise, host, store, exhibit, distribution and
                sub-distribution (through multiple tiers) right/s to use the
                content (in part or whole) in any manner, method or media
                whatsoever without limitations. You affirm, represent and
                warrant to us that you have all the rights, consents,
                permissions, capacity, power and authority necessary to grant
                the above license/rights to us. If needed You also agree and
                authorise us to modify the content to the technical requirements
                of connecting networks, devices, services or media. You agree
                that we are not responsible for protecting and enforcing any
                intellectual property rights granted by you to us in connection
                with these Terms of Use and we have no obligation to do so on
                your behalf.
              </p>
              <p>
                You acknowledge and agree that your use of the website/mobile
                app/services, including, without limitation, the storage of any
                data, files, information and/or other materials on a server
                owned or under our control or in any way connected to the
                Service, shall be at your sole risk and responsibility and we
                shall have no obligation to back-up such data, files,
                information and/or other materials. We expressly reserve the
                right to limit storage capacity and to remove and/or delete any
                data, files, and/or other information stored or used in
                connection with the Service for any reason including, without
                limitation, if we deem, in our sole discretion, such data to be
                in violation of this Agreement and/or any rule or policy of ours
                and/or any local, state, country or international laws or
                regulations.
              </p>
              <p>
                The Intellectual properties such as Pictures, Audio Clips, Video
                Clips and other information are the property of the respective
                owners. Such material cannot be copied, duplicated and modified
                without written consent of the content owner and/or
                outceedo.com.
              </p>
              <p>
                The content owners can contact us at info@outceedo.com to remove
                your material if you identified it was uploaded into our website
                by third party without your consent. outceedo.com will deal with
                the issue raised as soon as possible and will cease all
                activities of that user/s. This section will apply to all our
                services that we offer/provide to all registered and/or
                non-registered users.
              </p>
            </Section>

            {/* User Profiles */}
            <Section title="User Profiles">
              <p>Users of this platform may register as following categories</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  i) Sports Experts such as Ex-Player/s, Manager/s, Coach/s,
                  Scout/s who are willing to offer various services to players
                </li>
                <li>
                  ii) Sports Players (4yrs to 40yrs) who are willing to book
                  services from experts,
                </li>
                <li>
                  iii) Sports Sponsors who are willing to sponsor Teams or
                  Individual Players
                </li>
                <li>
                  iv) Sports Teams who are willing to advertise their teams and
                  apply for sponsorships
                </li>
                <li>
                  v) Fan/Followers who are willing to explore experts and
                  players profiles and rate/like/share/write reviews
                </li>
              </ul>
            </Section>

            {/* User Accounts */}
            <Section title="User Accounts">
              <div className="space-y-6">
                {/* Sports Experts */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h4 className="font-bold text-red-500 mb-3">
                    i) Sports Experts (Experienced or Ex- Players/Team
                    Managers/Scouts/Coach)
                  </h4>
                  <div className="space-y-3 text-gray-600">
                    <p>
                      You acknowledge and agree to create a profile/account with
                      us and agree to complete the personal profile with
                      accurate, true, current and complete information. Sports
                      Experts must provide required information (full name,
                      address, email id, phone number, city & country) to
                      identify you as said category.
                    </p>
                    <p>
                      The only people who are authorized to create Sports Expert
                      account on this website/app are sophisticated or
                      accredited Sports experts either Experienced or
                      Ex-Players, Ex-Team Managers, Ex-Scouts, Ex-Coach, with
                      professional experience in football.
                    </p>
                    <p>
                      You agree to submit your Sports Registration or License
                      certificates, PVG certificates, Disclose Certificate,
                      Disclosure & Barring Service Certificate, Social Media
                      Accounts to us. Failing to do so your account will be
                      suspended or deleted.
                    </p>
                    <p>
                      You agree that your account will be ceased if found you
                      are not the owner of the content uploaded. Any improper
                      material (pornography, illegal, harmful, abusing material,
                      copy right materials, etc) uploaded will be deleted and
                      account will be ceased immediately without notice.
                    </p>
                    <p>
                      You acknowledge and agree with the information provided in
                      our website/app (including how it works, services,
                      options, our fees/pricing, faq, etc) and agree with
                      General Terms and Conditions, Privacy Policy, Service
                      Agreements.
                    </p>
                    <p>
                      Using your account you agree to upload your information
                      (Biography, Videos, Pictures, certificates, awards, social
                      media details, etc) into outceedo.com (the "Website"). You
                      agree to submit the required documentation to prove
                      certification level in sports, you the owner of the
                      content you are uploading, you are diligently providing
                      the services which you are displayed in your profile.
                    </p>
                    <p>
                      For services, you acknowledge and agree the following that
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        you provide a reasonable rate for your service based on
                        your experience.
                      </li>
                      <li>
                        you provide your availability and non-availability with
                        time slots (each day) in the calendar we provided.
                      </li>
                      <li>
                        you attend and complete the bookings you accepted from
                        players.
                      </li>
                      <li>
                        you cancel or reschedule (if needed) the bookings if you
                        cannot fulfil on the planned date
                      </li>
                      <li>
                        you complete the assessment report and submit it to the
                        player on time (within 3 workings days after
                        task/service completion)
                      </li>
                    </ul>
                    <p>
                      You agree that once you completed your booking, you will
                      press the "Mark as Complete" button to fully close the
                      bookings.
                    </p>
                    <p>
                      You agree that you give permission to record and download
                      the videos of Trainings (Online or On Ground) to the
                      players. You also give permission to the player to use
                      these videos as a proof of trainings.
                    </p>
                    <p>
                      You agree that Outceedo Ltd will deduct 10% from your
                      earnings as a commission before we transfer the remaining
                      (90%) earnings to you.
                    </p>
                    <p>
                      You agree that you will pay all your taxes on your
                      earnings by yourself.
                    </p>
                    <p>
                      You agree that to claim your payments you will press the
                      "Payment Claim" button, which notifies us about your
                      claim. You also agree to provide your bank details in
                      order to process your payments.
                    </p>
                    <p>
                      You agree that your payment will be processed and
                      deposited into your bank account within 7-10 working days
                      after you press the "Payment Claim" button
                    </p>
                    <p>
                      You agree and acknowledge that, we as a service provider
                      with best of our knowledge and skill, scrutinise the
                      registered users and their details. But we cannot,
                      however, guarantee that users that see your content do not
                      distribute that information. We also cannot guarantee that
                      there will never be a software bug or a hacker attack that
                      allows unauthorized viewing of material or that users
                      actually fit within the categories they have identified
                      themselves under.
                    </p>
                  </div>
                </div>

                {/* Players */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h4 className="font-bold text-red-500 mb-3">ii) Players</h4>
                  <div className="space-y-3 text-gray-600">
                    <p>
                      You acknowledge and agree to create a profile/account with
                      us and agree to complete the personal profile with
                      accurate, true, current and complete information. Sports
                      Players must provide required information (full name,
                      address, email id, phone number, city & country) to
                      identify you as said category.
                    </p>
                    <p>
                      You agree that the only people who are authorized to
                      create Sports Player account on this website/app are users
                      above 18 years of age. Any minor player wishes to create
                      an account; it must be created by their legal parents or
                      legal guardian.
                    </p>
                    <p>
                      You agree that for Minor Player accounts, their legal
                      parents or guardians bear full responsibility for
                      creating, updating, maintaining of minor player accounts.
                    </p>
                    <p>
                      You agree that for Minor Player accounts their legal
                      parents or guardians bear full responsibility for all
                      transactions and interactions (online & on-ground) with
                      the experts during training or any other services.
                    </p>
                    <p>
                      You agree that for Minor Player their legal parents or
                      guardians bear full responsibility whatsoever using this
                      website/app.
                    </p>
                    <p>
                      You agree that your account will be ceased if found you
                      are not the owner of the content uploaded. Any improper
                      material (pornography, illegal, harmful, abusing material,
                      etc) uploaded will be deleted and account will be ceased
                      immediately without notice.
                    </p>
                    <p>
                      You acknowledge and agree with the information provided in
                      our website/app (including how it works, services,
                      options, our fees/pricing, faq, etc) and agree with
                      General Terms and Conditions, Privacy Policy, Service
                      Agreements.
                    </p>
                    <p>
                      Using your account you agree to upload your information
                      (Biography, Videos, Pictures, certificates, awards, social
                      media details, etc) into outceedo.com (the "Website"). You
                      agree to submit the required documentation to prove
                      certification level in sports, you the ownership of the
                      content you are uploading.
                    </p>
                    <p>
                      For bookings, you acknowledge and agree the following that
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>you pay for the services you booked.</li>
                      <li>
                        you provide enough details to the expert to attend your
                        bookings
                      </li>
                      <li>you attend the bookings on time</li>
                      <li>
                        you cannot claim refund for the bookings you missed or
                        for your delayed attendance
                      </li>
                      <li>
                        you inform us at least 72 hrs before if you cannot
                        attend the bookings and claiming refund.
                      </li>
                      <li>
                        you will receive your assessment report from expert
                        within 7 workings after task/service is completed.
                      </li>
                      <li>
                        you agree that once you completed your booking or
                        received your assessment report, you will press the
                        "Mark as Complete" button to fully close the bookings.
                      </li>
                    </ul>
                    <p>
                      You pay subscription fee of £10 each month to Outceedo Ltd
                      to get access to additional features or functionalities in
                      our website/app.
                    </p>
                    <p>
                      You agree that once the subscription is expired your
                      account will restore back to free account with limited use
                      of features and functionalities.
                    </p>
                    <p>
                      You agree that in case of minor player their legal parents
                      and guardians will be with the minor player during
                      Trainings – Online or On Ground and during on-Ground
                      assessments.
                    </p>
                    <p>
                      It is the responsibility of the legal parents and
                      guardians to monitor their minor player when interacting
                      (online or face to face) with the experts.
                    </p>
                    <p>
                      You agree that you will not book the experts and interact
                      with them outside of Outceedo Ltd and pay them directly.
                      In the event it happens then Outceedo Ltd is not
                      responsible for any issues it may cause to you and
                      Outceedo won't take any liability.
                    </p>
                    <p>
                      You agree that you will give reasonable rating and reviews
                      to the experts for their services.
                    </p>
                    <p>
                      You agree that you will not mention or use any illegal,
                      offending, abusive, derogatory words.
                    </p>
                    <p>
                      You agree that Outceedo Ltd is not responsible for not
                      receiving sponsorships. You agree that we will not take
                      any liability about your sponsorship applications
                      acceptance/rejections/delays or not receiving funds from
                      sponsors.
                    </p>
                  </div>
                </div>

                {/* Teams */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h4 className="font-bold text-red-500 mb-3">iii) Teams</h4>
                  <div className="space-y-3 text-gray-600">
                    <p>
                      You acknowledge and agree to create a profile/account with
                      us and agree to complete the personal profile with
                      accurate, true, current and complete information. Sports
                      Teams must provide required information (full name,
                      address, email id, phone number, city & country) to
                      identify you as said category.
                    </p>
                    <p>
                      You agree that the only people who are authorized to
                      create Sports Team account on this website/app are users
                      above 18 years of age and must be by the teams coach only.
                    </p>
                    <p>
                      You agree that your account will be ceased if found you
                      are not the owner of the content uploaded. Any improper
                      material (pornography, illegal, harmful, abusing material,
                      etc) uploaded will be deleted and account will be ceased
                      immediately without notice.
                    </p>
                    <p>
                      You acknowledge and agree with the information provided in
                      our website/app (including how it works, services,
                      options, our fees/pricing, faq, etc) and agree with
                      General Terms and Conditions, Privacy Policy, Service
                      Agreements.
                    </p>
                    <p>
                      Using your account you agree to upload your information
                      (Biography, Videos, Pictures, certificates, awards, social
                      media details, etc) into outceedo.com (the "Website"). You
                      agree to submit the required documentation to prove
                      certification level in sports, you the ownership of the
                      content you are uploading.
                    </p>
                    <p>
                      You agree that you will give reasonable rating and reviews
                      to the experts for their services.
                    </p>
                    <p>
                      You agree that you will not mention or use any illegal,
                      offending, abusive, derogatory words.
                    </p>
                    <p>
                      You agree that Outceedo Ltd is not responsible for not
                      receiving sponsorships. You agree that we will not take
                      any liability about your sponsorship applications
                      acceptance/rejections/delays or not receiving funds from
                      sponsors.
                    </p>
                  </div>
                </div>

                {/* Sponsors */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h4 className="font-bold text-red-500 mb-3">iv) Sponsors</h4>
                  <div className="space-y-3 text-gray-600">
                    <p>
                      You acknowledge and agree to create a profile/account with
                      us and agree to complete the personal profile with
                      accurate, true, current and complete information. Sports
                      Sponsor must provide required information (full name,
                      address, email id, phone number, city & country) to
                      identify you as said category.
                    </p>
                    <p>
                      You agree that the only people who are authorized to
                      create Sports Sponsor account on this website/app are
                      users above 18 years of age and must be an accredited
                      sponsor only.
                    </p>
                    <p>
                      You agree that your account will be ceased if found you
                      are not the owner of the content uploaded. Any improper
                      material (pornography, illegal, harmful, abusing material,
                      etc) uploaded will be deleted and account will be ceased
                      immediately without notice.
                    </p>
                    <p>
                      You acknowledge and agree with the information provided in
                      our website/app (including how it works, services,
                      options, our fees/pricing, faq, etc) and agree with
                      General Terms and Conditions, Privacy Policy, Service
                      Agreements.
                    </p>
                    <p>
                      Using your account you agree to upload your information
                      (Biography, Videos, Pictures, certificates, awards, social
                      media details, etc) into outceedo.com (the "Website"). You
                      agree to submit the required documentation to prove
                      certification level in sports, you the ownership of the
                      content you are uploading.
                    </p>
                    <p>
                      You agree that the applications you accepted will be
                      sponsored via Outceedo Ltd.
                    </p>
                    <p>
                      You agree that you will give reasonable rating and reviews
                      to the experts for their services.
                    </p>
                    <p>
                      You agree that you will not mention or use any illegal,
                      offending, abusive, derogatory words.
                    </p>
                    <p>
                      You agree that Outceedo Ltd is not responsible for not
                      receiving sponsorships. You agree that we will not take
                      any liability about your sponsorship applications
                      acceptance/rejections/delays or not receiving funds from
                      sponsors.
                    </p>
                  </div>
                </div>

                {/* Promoters/Audience */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <div className="space-y-3 text-gray-600">
                    <p>
                      You acknowledge and agree to create a profile/account with
                      us and agree to complete the personal profile with
                      accurate, true, current and complete information.
                      Promoters/Audience must provide required information (full
                      name, address, email id, phone number, etc) to identify
                      you as said category. You acknowledge and agree to accept
                      email marketing, movie information sent to you via
                      sms/text/whatsapp. Individuals interested to promote,
                      request, rate or review movies will register under this
                      category. Audience can also request movies to be screened
                      at their preferred locations. Registered individuals have
                      an option to Rate, Like, Share movie details to family and
                      friends and earn loyalty points. You acknowledge and agree
                      to provide your bank details (bank name, account name,
                      account number, IFSC code, bank address) to us in order
                      for you to claim/redeem loyalty points. Individuals may
                      opt out from email marketing and/or any kind of marketing
                      by clicking unsubscribe link provided in emails. We
                      protect your personal information as per our privacy
                      policy.
                    </p>
                  </div>
                </div>

                {/* Fans/Followers */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h4 className="font-bold text-red-500 mb-3">
                    v) Fans/Followers
                  </h4>
                  <div className="space-y-3 text-gray-600">
                    <p>
                      You acknowledge and agree to create a profile/account with
                      us and agree to complete the personal profile with
                      accurate, true, current and complete information.
                      Fans/Followers must provide required information (full
                      name, address, email id, phone number, city & country) to
                      identify you as said category.
                    </p>
                    <p>
                      You agree that the only people who are authorized to
                      create Fans/Followers account on this website/app are
                      users above 18 years of age.
                    </p>
                    <p>
                      You agree that your account will be ceased if found you
                      are not the owner of the content uploaded. Any improper
                      material (pornography, illegal, harmful, abusing material,
                      etc) uploaded will be deleted and account will be ceased
                      immediately without notice.
                    </p>
                    <p>
                      You acknowledge and agree with the information provided in
                      our website/app (including how it works, faq, etc) and
                      agree with General Terms and Conditions, Privacy Policy,
                      Service Agreements.
                    </p>
                    <p>
                      Using your account you agree to upload your information
                      (Biography, Videos, Pictures, certificates, awards, social
                      media details, etc) into outceedo.com (the "Website"). You
                      agree to submit the required documentation to prove
                      certification level in sports, you the ownership of the
                      content you are uploading.
                    </p>
                    <p>
                      You agree that you will give reasonable rating and reviews
                      to the experts for their services.
                    </p>
                    <p>
                      You agree that you will not mention or use any illegal,
                      offending, abusive, derogatory words.
                    </p>
                  </div>
                </div>

                {/* Change of Details */}
                <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                  <h4 className="font-bold text-red-600 mb-3">
                    CHANGE OF DETAILS:
                  </h4>
                  <p className="text-gray-600">
                    Users acknowledge and agree that First Name, Last Name,
                    Email ID and Phone number cannot be changed once published.
                    These details can only be changed by Outceedo.com on user's
                    request.
                  </p>
                </div>
              </div>
            </Section>

            {/* Bookings and Payment Methods */}
            <Section title="Bookings and Payment Methods">
              <div className="space-y-6">
                {/* Players */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h4 className="font-bold text-red-500 mb-3">i) Players</h4>
                  <div className="space-y-3 text-gray-600">
                    <p>
                      You acknowledge and agree to pay outceedo.com for the
                      services (Premium Account, Expert Bookings, Marketing) you
                      have chosen in our website/mobile app by following payment
                      methods :
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        Debit/Credit Cards using our third party (Stripe)
                        payment gateway
                      </li>
                      <li>Paying in Great British Pounds (GBP £)</li>
                    </ul>
                    <p>
                      Debit/credit cards (Visa, MasterCard and Credit/Debit
                      Cards), credit cards will incur an additional transaction
                      fee of 3.5% including VAT of the total payable price.
                      There is no transaction fee if payment is made by debit
                      card. By agreeing to these conditions, you authorise us to
                      use your debit/credit card details to process any
                      payments.
                    </p>
                    <p>
                      We accept Visa, MasterCard and Discover to pay us using
                      our website. We use a third-party payment gateway (Stripe)
                      to process payments made to outceedo.com. The third-party
                      payment gateway service provider will require certain
                      financial information including your credit card /debit
                      card or other banking information. You agree and/or
                      authorise us, or an authorized third party on our behalf,
                      to supply information such as your full name, address and
                      debit/credit card and/or other billing information. You
                      agree to provide us or such third party with accurate,
                      true, complete and current information. You shall be
                      responsible for all charges made in your order, as well
                      any applicable fees and taxes. All payments must be paid
                      in part or full which includes VAT, fee for payment
                      gateway. Payments made other than Great British Pounds
                      (GBP £) will incur currency conversion fee by the
                      respective purchaser's bank.
                    </p>
                    <p>
                      You agree to provide our third-party payment gateway all
                      your relevant information required to complete the
                      transactions. outceedo.com disclaims all liabilities in
                      relation to your payment processing by third party payment
                      gateway service provider and the collection and processing
                      of any information provided to third party payment gateway
                      service provider. While using such payment gateways to
                      make payments to outceedo.com, you will be required to
                      accept the terms of use and privacy policies of such
                      payment gateway service provider. We request you to please
                      make yourself familiar with the terms of use and privacy
                      policies of such payment gateway service provider before
                      using their service.
                    </p>
                  </div>
                </div>

                {/* Sports Expert */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h4 className="font-bold text-red-500 mb-3">
                    ii) Sports Expert
                  </h4>
                  <div className="space-y-3 text-gray-600">
                    <p>
                      You acknowledge and agree to provide us with your bank
                      details such as Bank Name & Location, Account Name,
                      Account Number, IFSC Code and other required details to
                      transfer your service payments. The payments will be in
                      Great British Pounds (GBP £), if you require in other
                      currencies then it will incur conversion fees which will
                      be deducted before transfer.
                    </p>
                    <p>
                      You also acknowledge and agree that you will receive 90%
                      of your service payments after deduction of 10% as our
                      commission.
                    </p>
                  </div>
                </div>
              </div>
            </Section>

            {/* Cancellation and Refunds */}
            <Section title="Cancellation and Refunds">
              <p>
                You acknowledge and agree that any cancellations in part or full
                must be made within 72hours of bookings/purchases completed. A
                cancellation fee will apply for all cancellations. After 24hours
                outceedo.com consider the bookings as completely confirmed and
                will not accept any further cancellations. We reserve the right
                to charge purchaser a 100% cancellation fee. Any cancellations
                made by outceedo.com for any unforeseen circumstances,
                outceedo.com will refund the purchaser with a 100% payment
                refund. All refunds in both cases will be processed within 15
                working days (excluding Saturdays and Sundays) from the
                cancellation date. And the purchaser will receive the payment
                after 15 working days (excluding Saturdays and Sundays).
              </p>
            </Section>

            {/* Accuracy */}
            <Section title="Accuracy">
              <p>
                You acknowledge and agree that the information that we
                disclose/display in our website/app is based on the information
                provided to us by players, sports experts, sponsors, sports
                teams, fans/followers. We have given access to the content
                providers/users to update the correct information from time to
                time. The content providers/users are fully responsible for
                updating all information, pricing, locations, terms,
                availability and other information which are displayed on our
                website/app. Although we will use reasonable skill and effort in
                checking the information including its accuracy, we cannot
                guarantee that all information is accurate, true, complete or
                correct, or can we be held responsible for any errors (including
                manifest and typographical errors), any interruptions (whether
                due to any temporary and/or partial breakdown, repair, upgrade
                or maintenance of our website/mobile app or otherwise),
                inaccurate, misleading or untrue information or non-delivery of
                information. Each content provider/users always remains
                responsible for the accuracy, trueness, completeness and
                correctness of the (descriptive) information (including the
                pricing, locations, terms, availability, other essential
                details) displayed on our website/mobile app.
              </p>
            </Section>

            {/* Rate/Like/Share */}
            <Section title="Rate/Like/Share">
              <p>
                We offer all users the opportunity to rate/like/share
                information. This Pre-Release Rating system we developed is
                solely to understand i) audience behaviour and their interests
                of a particular movie, or ii) testing, or iii) research, or iv)
                statistical and survey purposes and not to endorse or recommend
                any player or expert for business purposes. You as a player an
                expert acknowledge and agree that the above review process is
                solely for said purpose only and we cannot be held responsible
                for any losses and damages in any manner/methods.
              </p>
            </Section>

            {/* Website/Mobile Application Use */}
            <Section title="Website/Mobile Application Use">
              <p>
                You acknowledge and agree that there could be website/mobile
                application coding errors or any other kinds of
                inaccuracies/bugs that can affect the functionality or usability
                of the website or mobile application. In the event of such
                occurrences, we will try to resolve the issues (such as
                transactions, bookings, cancellations, refunds, account updates,
                etc.) offline and as soon as practically possible. We can't
                guarantee that our work will be error-free and so we can't be
                liable to you or any third party for damages, including lost
                profits, lost savings or other incidental, consequential or
                special damages, any other losses, even if you have advised us
                of them. You acknowledge and agree that you have adequate
                knowledge and competency or will use a competent person on your
                behalf to use our website or mobile application. We are not
                liable to you or any third party for damages, including lost
                profits, lost savings or other incidental, consequential or
                special damages that are caused due to your incompetency in
                using our website or mobile application.
              </p>
            </Section>

            {/* Indemnity */}
            <Section title="Indemnity">
              <div className="bg-red-50 rounded-xl p-4 border border-red-100 uppercase text-sm">
                <p className="text-gray-700">
                  YOU AGREE TO INDEMNIFY, DEFEND AND HOLD OUTCEEDO.COM, ITS
                  PARENT COMPANIES, SUBSIDIARIES, OUR OFFICERS, DIRECTORS,
                  SHAREHOLDERS, MANAGERS, EMPLOYEES, AFFILIATES AND AGENTS
                  HARMLESS FROM AND AGAINST ALL ALLEGATIONS, LIABILITIES,
                  ACTIONS, SUITS, LOSSES, DEMANDS, DAMAGES, FINES, PENALITIES,
                  CLAIMS, OBLIGATIONS, SETTLEMENTS, JUDGEMENTS, COSTS AND
                  EXPENSES (INCLUDING WITHOUT LIMITATION REASONABLE LEGAL FEES)
                  ARISING OUT OF, RESULTING FROM, OR IN CONNECTION WITH THE
                  SERVICES CONTEMPLATED BY THIS AGREEMENT AND ALSO RELATED TO
                  YOUR BREACH OF THESE TERMS OF USE (INCLUDING, BUT NOT LIMITED
                  TO, ANY BREACH BY PERSONS ACTING ON YOUR BEHALF WHO ACCESS
                  THIS SITE USING WEBSITE ACCESS INFORMATION AND/OR
                  BOOKING/PURCHASE DATA THAT YOU HAVE PROVIDED TO THEM).
                </p>
              </div>
            </Section>

            {/* Arbitration */}
            <Section title="Arbitration">
              <p>
                "Any dispute arising out of or in connection with this contract,
                including any question regarding its existence, validity or
                termination, shall be referred to and finally resolved by
                arbitration under the London Court of International Arbitration
                (LCIA) Rules, which Rules are deemed to be incorporated by
                reference into this clause."
              </p>

              <div className="bg-white rounded-xl p-4 border border-gray-100 mt-4">
                <h4 className="font-bold text-red-500 mb-2">
                  i) Mediation only
                </h4>
                <p className="text-gray-600">
                  "In the event of a dispute arising out of or relating to this
                  contract, including any question regarding its existence,
                  validity or termination, the parties shall seek settlement of
                  that dispute by mediation in accordance with the LCIA
                  Mediation Procedure, which Procedure is deemed to be
                  incorporated by reference into this clause."
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100 mt-4">
                <h4 className="font-bold text-red-500 mb-2">
                  ii) Arbitration only
                </h4>
                <p className="text-gray-600">
                  "Any dispute arising out of or in connection with this
                  contract, including any question regarding its existence,
                  validity or termination, shall be referred to and finally
                  resolved by arbitration under the Rules of the LCIA, which
                  Rules are deemed to be incorporated by reference into this
                  clause. The number of arbitrators shall be one or three. The
                  seat, or legal place, of arbitration shall be London, United
                  Kingdom. The language to be used in the arbitral proceedings
                  shall be English. The governing law of the contract shall be
                  the substantive law of United Kingdom."
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100 mt-4">
                <h4 className="font-bold text-red-500 mb-2">
                  iii) Mediation and Arbitration
                </h4>
                <p className="text-gray-600">
                  "In the event of a dispute arising out of or relating to this
                  contract, including any question regarding its existence,
                  validity or termination, the parties shall first seek
                  settlement of that dispute by mediation in accordance with the
                  LCIA Mediation Procedure, which Procedure is deemed to be
                  incorporated by reference into this clause. If the dispute is
                  not settled by mediation within 30 days of the appointment of
                  the mediator, or such further period as the parties shall
                  agree in writing, the dispute shall be referred to and finally
                  resolved by arbitration under the LCIA Rules, which Rules are
                  deemed to be incorporated by reference into this clause.
                </p>
                <p className="text-gray-600 mt-2">
                  The number of arbitrators shall be one or three. The seat, or
                  legal place, of arbitration shall be London, United Kingdom.
                  The language to be used in the arbitral proceedings shall be
                  English. The governing law of the contract shall be the
                  substantive law of United Kingdom."
                </p>
              </div>

              <p className="mt-4">
                In the event if the dispute is not resolved by mediation and/or
                arbitration, you and we both agree that if you were able to
                bring a claim arising from or in connection with this contract
                against us in court, an acceptable court would be a court
                located in London, United Kingdom.
              </p>
            </Section>

            {/* Our Liability */}
            <Section title="Our Liability">
              <p>
                You acknowledge and agree that outceedo.com, its parent company
                and its subsidiaries will not be responsible for (i) losses that
                were not caused by any breach on our part, or (ii) any business
                loss (including loss of profits, revenue, time, contracts,
                anticipated savings, data, goodwill or wasted expenditure), or
                (iii) losses that were caused due to fans/followers ratings on
                your profiles, or (iv) losses that were caused due to bad
                content (biography, text, pictures, videos, etc), or (v) losses
                due to changing fans/users/investors behaviour or interests, or
                (vi) losses due to non-availability of experts, (vii) losses due
                to your inability to use the service for any reason, (viii) any
                bugs, viruses, trojan horses, or the like which may be
                transmitted to or through our website or by any third party,
                (ix) due to errors in website and/or mobile application
                functionality, (x) loses due to cross country money transfer
                transactional fees, currency rates, currency conversion rates,
                additional charges, etc, (xi) loses due to inability to transfer
                the money due to government law in any country, (xii) events
                beyond our reasonable control including any internet failures,
                equipment failures, telecommunications problems, electrical
                power failures, strikes, labour disputes, industrial actions,
                riots, insurrections, civil and military disturbances, changes
                to current laws and regulations, severe weather conditions,
                shortages of labour or materials, transportation or courier
                delays, fires, floods, lockdowns, pandemics, storms,
                earthquakes, nuclear accidents, explosions, volcanic eruptions,
                acts of God, embargoes, war, hacker attacks, terrorist acts,
                intergalactic struggles, illegal activities of third parties,
                laws, governmental actions, orders of courts, agencies or
                tribunals or non-performance of third parties, or (xiii) any
                indirect or consequential losses that were not foreseeable to
                both you and us, (xiv) loses due to any reasons that are
                specified in our risk warnings. In no event shall we be liable
                for any damages whatsoever (including, without limitation,
                incidental and consequential damages, lost profits, or damages
                resulting from lost data or business interruption) resulting
                from the use or inability to use the website or mobile app and
                the content, whether based on warranty, contract, tort
                (including negligence), or any other legal theory. outceedo.com
                and its subsidiaries will not be held responsible for any
                non-availability of experts/investors and any cancellations made
                by them. We will not be held responsible for any delay or
                failure to deliver the services on time. Such delay or failure
                arises from any cause which is beyond our reasonable control.
                outceedo.com disclaims any and all liabilities in relation to
                your payment processing by third party payment gateway service
                provider and the collection and processing of any information
                provided to third party payment gateway service provider. While
                using such payment gateways to make payments to outceedo.com,
                you will be required to accept the terms of use and privacy
                policies of such payment gateway service provider. We request
                you to please make yourself familiar with the terms of use and
                privacy policies of such respective payment gateway service
                provider before using their service.
              </p>
            </Section>

            {/* Changes to Terms of Use */}
            <Section title="Changes to Terms of Use">
              <p>
                We reserve the right at our sole discretion to change, modify,
                add or remove any portion of these Terms of Use in whole or in
                part, at any time with or without a notice. We may need to make
                changes to these Terms from time to time for many reasons, such
                as to reflect updates in how the services work, addition of new
                features or services, modifying/removal of existing features or
                services, changes in the law, changes in technology and to meet
                any other requirements. You should look at these Terms of Use
                regularly, which are posted in this website/mobile app. If we
                make changes to these Terms, we would notify you by email, if
                you provided one during registration. Therefore, it is essential
                to provide the correct details for any communications. Your
                continued use or access to outceedo.com and its services after
                any such changes constitutes your acceptance of the new Terms of
                Use.
              </p>
            </Section>

            {/* Warranty Disclaimer */}
            <Section title="Warranty Disclaimer">
              <div className="bg-red-50 rounded-xl p-4 border border-red-100 uppercase text-sm">
                <p className="text-gray-700">
                  WE, AND OUR AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES,
                  AGENTS, SUPPLIERS, MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT
                  THE CONTENT (INCLUDING THE USER CONTENT) AND SERVICES,
                  INCLUDING BUT NOT LIMITED TO ITS ACCURACY, COMPLETENESS,
                  TIMELINESS, OR RELIABILITY. WE SHALL NOT BE SUBJECT TO
                  LIABILITY FOR TRUTH, ACCURACY, OR COMPLETENESS OF ANY
                  INFORMATION CONVEYED TO THE USER OR FOR ERRORS, MISTAKES OR
                  OMISSIONS THEREIN OR FOR ANY DELAYS OR INTERRUPTIONS OF THE
                  DATA OR INFORMATION STREAM FROM WHATEVER CAUSE. YOU AGREE THAT
                  YOU USE THE WEBSITE/MOBILE APP AND THE CONTENT AT YOUR OWN
                  RISK. THE USER CONTENT IS CREATED/PUBLISHED BY REGISTERED
                  MEMBERS. ANY VIEWS EXPRESSED ARE THEIRS AND UNLESS
                  SPECIFICALLY STATED ARE NOT THOSE OF OUTCEEDO.COM.
                  OUTCEEDO.COM IS NOT RESPONSIBLE FOR ANY CONTENT POSTED BY
                  REGISTERED MEMBERS ON OUR WEBSITE/MOBILE APP OF FOR THE
                  AVAILABILITY OR CONTENT OF ANY THIRD-PARTY SITES THAT ARE
                  ACCESSIBLE THROUGH OUR WEBSITE/MOBILE APP. ANY LINKS TO THIRD
                  PARTY WEBSITES DO NOT AMOUNT TO AN ENDORSEMENT OF THAT
                  WEBSITE/COMPANY AND ANY USE OF THAT WEBSITE BY YOU IS ENTIRELY
                  AT YOUR OWN RISK. WE DO NOT WARRANT THAT THE WEBSITE/MOBILE
                  APP WILL OPERATE ERROR FREE OR THAT THIS WEBSITE/MOBILE APP,
                  ITS SERVER, OR THE CONTENT IS FREE OF COMPUTER VIRUSES OR
                  SIMILAR CONTAMINATION OR DESTRUCTIVE FEATURES. IF YOUR USE OF
                  THE WEBSITE/MOBILE APP OR THE CONTENT RESULTS IN THE NEED FOR
                  SERVICING OR REPLACING EQUIPMENT OR DATA, WE SHALL NOT BE
                  RESPONSIBLE FOR THOSE COSTS. THE WEBSITE/MOBIE APP AND CONTENT
                  ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT
                  ANY WARRANTIES OF ANY KIND. WE HEREBY DISCLAIM ALL WARRANTIES,
                  INCLUDING, BUT NOT LIMITED TO, THE WARRANTY OF TITLE,
                  MERCHANTABILITY, QUALITY, NON-INFRINGEMENT OF THIRD PARTIES'
                  RIGHTS, AND FITNESS FOR PARTICULAR PURPOSE.
                </p>
              </div>
            </Section>

            {/* User Acknowledgement */}
            <Section title="User Acknowledgement">
              <p>
                You as a Player, Sport Expert, Team, Sponsor, Fan/Floower
                acknowledge and agree that you have read and clearly understand
                all our Terms of use, General Terms and Conditions, Service
                Agreements, How it works, Privacy policy, Subscription Options,
                Fee/Pricing, Purchases and Payment methods, FAQ's, risk
                warnings, Cancellations and Refunds).
              </p>
            </Section>

            {/* Termination */}
            <Section title="Termination">
              <p>
                You may cancel your account at any time by emailing us at
                info@outceedo.com. Once your account is cancelled all your
                content will be immediately purged. Since purge of all data is
                final, please be sure that you do in fact want to cancel your
                account before doing so. We reserve the right to refuse service,
                terminate accounts, remove or edit content if you are in breach
                of applicable laws, these Terms of Use, any other applicable
                terms and conditions, guidelines or policies. Our rights under
                this Agreement will automatically terminate without notice and
                without refund of any dues if you fail to comply with the terms.
                We may terminate the Agreement, restrict, suspend or terminate
                your use of our website, mobile app and services at our
                discretion without notice at any time, including if we determine
                that your use violates the Agreement, is improper, or otherwise
                involves fraud or misuse our website/mobile app and services or
                harms our interests or those of another user.
              </p>
            </Section>

            {/* Links to Third Party Websites */}
            <Section title="Links to Third Party Websites">
              <p>
                You can link to other websites by means of hyperlinks published
                on this website or emailed to you as part of our service. These
                websites are owned and operated by third parties. We do not
                endorse any third-party websites linked on our
                website/application/service. You are responsible for your
                interactions with any third-party websites. Third party websites
                linked to our website/application/service have their own terms
                and privacy policy and you are responsible for compliance with
                such terms and privacy policies. We accept no liability for any
                statements, information, products or services that are published
                on or may be accessible through third party websites.
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
                  Web:{" "}
                  <a
                    href="https://outceedo.com"
                    className="text-red-500 hover:underline font-bold"
                  >
                    outceedo.com
                  </a>
                </p>
                <p>
                  Email:{" "}
                  <a
                    href="mailto:info@outceedo.com"
                    className="text-red-500 hover:underline font-bold"
                  >
                    info@outceedo.com
                  </a>
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
