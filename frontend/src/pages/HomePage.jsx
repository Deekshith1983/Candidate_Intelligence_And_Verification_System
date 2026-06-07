import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Footer } from '../components/Footer';

export const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleRoleRedirect = (role) => {
    navigate(`/register?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-white-primary flex flex-col">
      {/* HERO SECTION */}
      <section className="bg-grey-mild border-b border-slate-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-block px-3 sm:px-5 py-1.5 sm:py-2 rounded-full bg-teal-light text-primary-teal text-xs sm:text-sm font-bold mb-4 sm:mb-8">
              Candidate Intelligence Platform
            </div>

            {/* Heading */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-navy leading-tight mb-4 sm:mb-6">
              Beyond the CV.
              <br />
              Data-Driven Talent Verification.
            </h1>

            {/* Subtext */}
            <p className="text-xs sm:text-sm md:text-base text-slate-grey max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-10">
              A platform that scores candidates based on verified skills,
              GitHub contributions, and ATS-optimized resumes. Connect talent
              with recruiters through trust and transparency.
            </p>

            {/* CTA Buttons */}
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-4">
                {/* Candidate Button */}
                <button
                  onClick={() => handleRoleRedirect('candidate')}
                  className="px-6 sm:px-10 py-2.5 sm:py-4 bg-primary-teal text-white-primary rounded-button font-semibold hover:bg-teal-600 transition text-xs sm:text-sm"
                >
                  I am a candidate →
                </button>

                {/* Recruiter Button */}
                <button
                  onClick={() => handleRoleRedirect('recruiter')}
                  className="px-6 sm:px-10 py-2.5 sm:py-4 border border-primary-teal text-primary-teal rounded-button font-semibold hover:bg-teal-light transition text-xs sm:text-sm"
                >
                  I am a recruiter →
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-12 sm:py-16 md:py-20 bg-white-primary flex-grow">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <p className="text-center text-xs sm:text-sm text-slate-grey mb-8 sm:mb-12 uppercase tracking-wider">
            How It Works
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[
              {
                number: '01',
                title: 'Build profile',
                desc:
                  'Create your candidate account and add your basic information',
              },
              {
                number: '02',
                title: 'Link GitHub',
                desc:
                  'Verify your GitHub account to unlock full scoring features',
              },
              {
                number: '03',
                title: 'Submit projects',
                desc:
                  'Add your projects for automated scoring and verification',
              },
              {
                number: '04',
                title: 'Get scored',
                desc:
                  'Receive your credibility score and get discovered by recruiters',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white-primary rounded-card p-3 sm:p-4 border border-slate-300 text-center shadow-soft"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-primary-teal mb-3 sm:mb-6">
                  {item.number}
                </h2>

                <h3 className="text-sm sm:text-base font-bold text-primary-navy mb-2 sm:mb-3">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-grey leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOWER SPLIT SECTION */}
      <section className="bg-grey-mild border-y border-slate-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2">
          {/* Left Side */}
          <div className="p-4 sm:p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-300">
            <p className="text-xs sm:text-sm text-primary-teal font-bold mb-2 sm:mb-5 uppercase tracking-wider">
              For Candidates
            </p>

            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-navy mb-3 sm:mb-4">
              Prove what you can build
            </h2>

            <p className="text-xs sm:text-sm text-slate-grey leading-relaxed mb-4 sm:mb-8 max-w-lg">
              Showcase your skills through verified GitHub projects and get
              scored on real contributions. Stand out with credibility, not
              just keywords.
            </p>

            {!isAuthenticated && (
              <button
                onClick={() => handleRoleRedirect('candidate')}
                className="inline-block px-4 sm:px-8 py-2 sm:py-4 border border-primary-teal text-primary-teal rounded-button font-semibold hover:bg-teal-light transition text-xs sm:text-sm"
              >
                Create candidate profile →
              </button>
            )}
          </div>

          {/* Right Side */}
          <div className="p-4 sm:p-8 md:p-12">
            <p className="text-xs sm:text-sm text-primary-teal font-bold mb-2 sm:mb-5 uppercase tracking-wider">
              For Recruiters
            </p>

            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-navy mb-3 sm:mb-4">
              Find verified talent instantly
            </h2>

            <p className="text-xs sm:text-sm text-slate-grey leading-relaxed mb-4 sm:mb-8 max-w-lg">
              Search candidates by credibility score, filter by verified GitHub
              profiles, and discover developers who can actually deliver.
            </p>

            {!isAuthenticated && (
              <button
                onClick={() => handleRoleRedirect('recruiter')}
                className="inline-block px-4 sm:px-8 py-2 sm:py-4 border border-primary-teal text-primary-teal rounded-button font-semibold hover:bg-teal-light transition text-xs sm:text-sm"
              >
                Access recruiter dashboard →
              </button>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};