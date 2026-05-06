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
      <div className="bg-white rounded-xl border border-slate-200 shadow-soft-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-blue-600">Skills</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors"
          >
            Edit Skills
          </button>
        </div>

        {/* Skills Display */}
        {editingSkills && editingSkills.length > 0 ? (
          <div className="flex flex-wrap gap-3 mb-6">
            {editingSkills.map((skill, idx) => (
              <div
                key={idx}
                className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <p className="font-semibold text-blue-900">
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
          <p className="text-slate-600 mb-6">No skills added yet. Click "Edit Skills" to add some!</p>
        )}

        {/* Skills Score */}
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
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-soft-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-blue-600">Edit Skills</h3>
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
<<<<<<< HEAD
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors"
=======
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed font-semibold transition-colors"
>>>>>>> 61eb115b948e1b9e708674a5a44e2943ff5c33ce
        >
          {loading ? 'Saving...' : 'Save + Re-score'}
        </button>
      </div>
    </div>
  );
};
