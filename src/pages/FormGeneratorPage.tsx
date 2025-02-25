import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Topbar from "../components/Dashboard/Topbar";
import PromptInput from "../components/PromptInput";
import { NotepadText } from "lucide-react";
import Input from "../components/Form/Input";
import Button from "../components/Form/Button";

const convertToCapitalized = (str: string) => {
  return str.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (char) => char.toUpperCase());
};

const FormGeneratorPage: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [components, setComponents] = useState<any[]>([]);
  const [schema, setSchema] = useState<z.ZodObject<any> | null>(null);

  const generateSchema = (fields: any[]) => {
    const shape: Record<string, any> = {};

    fields.forEach((field) => {
      let validator = z.string();

      if (field.required) {
        validator = validator.min(1, `${convertToCapitalized(field.name)} is required`);
      }

      if (field.minLength) {
        validator = validator.min(field.minLength, `${convertToCapitalized(field.name)} must be at least ${field.minLength} characters`);
      }

      if (field.maxLength) {
        validator = validator.max(field.maxLength, `${convertToCapitalized(field.name)} must be at most ${field.maxLength} characters`);
      }

      if (field.pattern) {
        validator = validator.regex(new RegExp(field.pattern), `Invalid ${convertToCapitalized(field.name)}`);
      }

      if (field.type === "email") {
        validator = z.string().email("Invalid email format");
      }

      shape[field.name] = validator;
    });

    return z.object(shape);
  };

  useEffect(() => {
    if (components.length > 0) {
      setSchema(generateSchema(components));
    }
  }, [components]);

  const handlePromptSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/dashboard/generate-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const { mode: responseMode, components: newComponents } = await response.json();

      setComponents((prev) => {
        if (responseMode === "replace") {
          return newComponents;
        } else if (responseMode === "append") {
          return [...prev, ...newComponents];
        } else if (responseMode === "remove") {
          const lowerCaseNames = newComponents.map((name: string) => name.toLowerCase());
          return prev.filter((component) => !lowerCaseNames.includes(component.name.toLowerCase()));
        }
        return prev;
      });

      setPrompt("");
    } catch (error) {
      console.error("Error generating components:", error);
    } finally {
      setLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
  });

  const onSubmit = (data: any) => {
    console.log("Form Data:", data);
    reset();
  };

  return (
    <div className="bg-white rounded-xl pb-4 shadow">
      <Topbar />
      <div className="px-4">
        <PromptInput
          icon={NotepadText}
          placeholder="Create a form with first name, last name, email..."
          prompt={prompt}
          setPrompt={setPrompt}
          handlePromptSubmit={handlePromptSubmit}
          loading={loading}
        />

        {components.length > 0 && schema && (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 p-4 border rounded bg-gray-50">
            <h2 className="text-lg font-medium mb-4">Your generated Form</h2>
            {components.map((component) => (
              <div key={component.name} className="mb-3">
                <Input
                  label={convertToCapitalized(component.name)}
                  type={component.type ?? "text"}
                  placeholder={`Enter ${convertToCapitalized(component.name)}`}
                  registration={register(component.name)}
                  error={errors[component.name]?.message as string}
                />
              </div>
            ))}

            <Button type="submit" variant="primary" size="md">
              Submit
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FormGeneratorPage;
