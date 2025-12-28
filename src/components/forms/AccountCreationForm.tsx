"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AccountCreationForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    student_id: "",
    email: "",
    major: "BSCS",
    year_level: 1,
    skills: [] as string[],
    interests: "",
  });
  const [skillInput, setSkillInput] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "year_level" ? parseInt(value) : value,
    }));
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          skills: [...prev.skills, skillInput.trim()],
        }));
        setSkillInput("");
      }
    }
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form
      if (!formData.name.trim() || !formData.student_id.trim() || !formData.email.trim()) {
        toast.error("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      // Create user via API
      const response = await fetch("/api/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          student_id: formData.student_id,
          email: formData.email,
          major: formData.major,
          year_level: formData.year_level,
          skills: formData.skills,
          interests: formData.interests
            .split(",")
            .map((i) => i.trim())
            .filter((i) => i),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || "Failed to create account");
        setIsLoading(false);
        return;
      }

      const { user_id } = await response.json();
      toast.success("Account created successfully! 🎉");

      // Redirect to dashboard
      setTimeout(() => {
        router.push(`/dashboard?userId=${user_id}`);
      }, 1000);
    } catch (error) {
      console.error("Error creating account:", error);
      toast.error("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-200">
          Full Name *
        </label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="John Doe"
          className="border-slate-600 bg-slate-700 text-white placeholder-slate-400"
          disabled={isLoading}
        />
      </div>

      {/* Student ID */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-200">
          Student ID *
        </label>
        <Input
          type="text"
          name="student_id"
          value={formData.student_id}
          onChange={handleInputChange}
          placeholder="2023-00123"
          className="border-slate-600 bg-slate-700 text-white placeholder-slate-400"
          disabled={isLoading}
        />
      </div>

      {/* Email */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-200">
          Email *
        </label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="john@example.com"
          className="border-slate-600 bg-slate-700 text-white placeholder-slate-400"
          disabled={isLoading}
        />
      </div>

      {/* Major & Year */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Major *
          </label>
          <select
            name="major"
            value={formData.major}
            onChange={handleInputChange}
            className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-white disabled:opacity-50"
            disabled={isLoading}
          >
            <option value="BSCS">BSCS - Computer Science</option>
            <option value="BSIT">BSIT - Information Technology</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Year Level *
          </label>
          <select
            name="year_level"
            value={formData.year_level}
            onChange={handleInputChange}
            className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-white disabled:opacity-50"
            disabled={isLoading}
          >
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-200">
          Skills (Press Enter to add)
        </label>
        <Input
          type="text"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={handleAddSkill}
          placeholder="e.g., React, Python, JavaScript..."
          className="border-slate-600 bg-slate-700 text-white placeholder-slate-400"
          disabled={isLoading}
        />
        {formData.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.skills.map((skill) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1 text-sm text-white"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-xs hover:text-slate-200"
                  disabled={isLoading}
                >
                  ✕
                </button>
              </motion.span>
            ))}
          </div>
        )}
      </div>

      {/* Interests */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-200">
          Career Interests (comma-separated)
        </label>
        <textarea
          name="interests"
          value={formData.interests}
          onChange={handleInputChange}
          placeholder="e.g., AI/ML, Web Development, DevOps"
          className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 disabled:opacity-50"
          rows={3}
          disabled={isLoading}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Creating Account..." : "Create Account & Start"}
      </Button>

      <p className="text-xs text-slate-400">
        By creating an account, you agree to our terms and privacy policy.
      </p>
    </form>
  );
}
