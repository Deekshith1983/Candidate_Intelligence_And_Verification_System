import React, { useState } from 'react';

export const InlineSkillEditor = ({
  skills = [],
  onSave,
  loading = false,
  scoreCard = null,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [editingSkills, setEditingSkills] = useState(skills);

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setEditingSkills([
        ...editingSkills,
        { name: skillInput.trim() }
      ]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (idx) => {
    setEditingSkills(editingSkills.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    await onSave(editingSkills);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditingSkills(skills);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-soft-lg p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-blue-600">Skills</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm font-semibold transition-colors flex-shrink-0"
          >
            Edit Skills
          </button>
        </div>

        {/* Skills Display */}
        {editingSkills && editingSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
            {editingSkills.map((skill, idx) => (
              <div
                key={idx}
                className="px-2 sm:px-4 py-1 sm:py-2 bg-blue-50 border border-blue-200 rounded-lg flex-shrink-0"
              >
                <p className="font-semibold text-blue-900 text-xs sm:text-sm break-words">
                  {typeof skill === 'object' ? skill.name : skill}
                </p>
                {typeof skill === 'object' && skill.sub_score !== undefined && (
                  <p className="text-xs text-blue-700 mt-1">
                    Score: {skill.sub_score}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 mb-4 sm:mb-6 text-xs sm:text-sm">No skills added yet. Click "Edit Skills" to add some!</p>
        )}

        {/* Skills Score */}
        {scoreCard && (
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 sm:p-4">
            <div className="flex justify-between items-center gap-2 mb-2 flex-wrap">
              <p className="text-xs sm:text-sm font-semibold text-slate-700">Skills Score</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 flex-shrink-0">
                {scoreCard.skills || 0}/40
              </p>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(scoreCard.skills || 0) / 40 * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Scoring: declaration (20%) + resume mention (30%) + project usage (50%) per skill
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-soft-lg p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-blue-600">Edit Skills</h3>
        <button
          onClick={handleCancel}
          className="text-slate-500 hover:text-slate-700 text-2xl"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Your Skills
          </label>
          <p className="text-sm text-slate-500 mb-3">
            Type a skill and press Enter to add it. Skills used in your verified GitHub projects automatically receive bonus scoring.
          </p>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="e.g., React, Node.js, Python"
            />
            <button
              onClick={handleAddSkill}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
          {editingSkills && editingSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {editingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                >
                  {typeof skill === 'object' ? skill.name : skill}
                  <button
                    onClick={() => handleRemoveSkill(idx)}
                    className="text-blue-700 hover:text-blue-900"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Skills Score Display */}
        {scoreCard && (
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-slate-700">Skills Score</p>
              <p className="text-sm font-semibold text-slate-700">
                {scoreCard.skills || 0}/40
              </p>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(scoreCard.skills || 0) / 40 * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Scoring: declaration (20%) + resume mention (30%) + project usage (50%) per skill
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
        <button
          onClick={handleCancel}
          className="flex-1 px-6 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors"
        >
          {loading ? 'Saving...' : 'Save + Re-score'}
        </button>
      </div>
    </div>
  );
};