import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Topbar from "../components/Topbar";
import PromptInput from "../components/PromptInput";
import { NotepadText } from "lucide-react";
import {
  FormProgressBar,
  Input,
  Button,
  Textarea,
  Checkbox,
  PasswordStrengthComponent,
  ConfirmPasswordMatch,
  Dropdown,
  DatePicker
} from "utility-package/form";
import { FileUploader } from "../../../utility-package/dist";

const convertToCapitalized = (str: string) => {
  return str.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (char) => char.toUpperCase());
};

const handleUpload = async (files: File[]) => {
  console.log("Uploading Files : ", files);

  await new Promise((resolve, _reject) => setTimeout(resolve, 2000));

  console.log("Upload Complete");
}

const componentMap: {
  [key: string]: (
    field: any,
    register: any,
    errors: any,
    control?: any,
    watch?: any,
    setValue?: any
  ) => React.ReactNode;
} = {
  text: (field, register, errors) => (
    <Input
      label={convertToCapitalized(field.name)}
      type="text"
      placeholder={`Enter ${convertToCapitalized(field.name)}`}
      registration={register(field.name)}
      error={errors[field.name]?.message as string}
    />
  ),
  email: (field, register, errors) => (
    <Input
      label={convertToCapitalized(field.name)}
      type="email"
      placeholder="Enter your email"
      registration={register(field.name)}
      error={errors[field.name]?.message as string}
    />
  ),
  password: (field, register, errors, _control, watch) => {
    const password = watch ? watch("password") || "" : "";

    return (
      <div className="flex flex-col gap-4">
        <Input
          label={convertToCapitalized(field.name)}
          type="password"
          placeholder="Enter your password"
          registration={register(field.name)}
          error={errors[field.name]?.message as string}
        />
        <PasswordStrengthComponent password={password} />
      </div>
    )
  },
  confirmPassword: (_field, register, errors, _control, watch) => {
    const password = watch ? watch("password") || "" : "";
    const confirmPassword = watch ? watch("confirmPassword") || "" : "";

    return (
      <div className="flex flex-col gap-4">
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          registration={register("confirmPassword")}
          error={errors.confirmPassword?.message as string}
        />
        <ConfirmPasswordMatch password={password} confirmPassword={confirmPassword} />
      </div>
    );
  },
  date: (field, _register, errors, control) => (
    <Controller
      name={field.name}
      control={control}
      render={({ field }) => (
        <DatePicker
          label={convertToCapitalized(field.name)}
          value={field.value}
          onChange={field.onChange}
          error={errors[field.name]?.message}
        />
      )}
    />
  ),
  textarea: (field, register, errors) => (
    <Textarea
      label={convertToCapitalized(field.name)}
      placeholder="Enter description..."
      registration={register(field.name)}
      error={errors[field.name]?.message as string}
    />
  ),
  dropdown: (field, _register, errors, control, watch, setValue) => {
    const dependsOnValue = field.dependsOn ? watch(field.dependsOn) || "" : "";

    return (
      <Controller
        name={field.name}
        control={control}
        render={({ field: controllerField }) => {
          useEffect(() => {
            if (field.dependsOn) {
              setValue(field.name, "");
            }
          }, [dependsOnValue, field.name, setValue]);

          return (
            <Dropdown
              label={field.label || "Select an option"}
              options={
                field.dependsOn
                  ? field.options[dependsOnValue] || []
                  : field.options
              }
              disabled={field.dependsOn && !dependsOnValue}
              value={controllerField.value}
              enableSearch={true}
              error={errors[field.name]?.message}
              onChange={controllerField.onChange}
            />
          );
        }}
      />
    );
  },
  checkbox: (field, _register, errors, control) => (
    <Controller
      name={field.name}
      control={control}
      defaultValue={field.default || false}
      rules={{ required: field.required ? "This field is required" : false }}
      render={({ field: { value, onChange } }) => (
        <Checkbox
          title={convertToCapitalized(field.name)}
          description={field.description || ""}
          checked={value}
          error={errors[field.name]?.message}
          onChange={onChange}
        />
      )}
    />
  ),
  fileUploader: (_field, _register, _errors) => (
    <FileUploader
      onUpload={handleUpload}
    // registration={register(field.name)}
    // error={errors[field.name]?.message as string}
    />
  ),
};


const FormGeneratorPage: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [steps, setSteps] = useState<Array<{ id: string; name: string; fields: string[]; }>>()
  const [components, setComponents] = useState<any[]>([]);
  const [schema, setSchema] = useState<z.ZodObject<any> | z.ZodEffects<z.ZodObject<any>> | null>(null);

  const generateSchema = (fields: any[]): z.ZodObject<any> | z.ZodEffects<z.ZodObject<any>> => {
    const shape: Record<string, any> = {};

    fields.forEach((field) => {
      let validator;

      if (field.type === "checkbox") {
        validator = z.boolean();

        if (field.required) {
          validator = validator.refine(val => val === true, {
            message: `${convertToCapitalized(field.name)} is required`,
          });
        }
      } else if (field.type === "dropdown") {
        if (field.dependsOn) {
          validator = z.string().refine((val) => val && val.trim() !== "", {
            message: `Select a ${field.name} from the dropdown`,
          });
        } else {
          validator = z.enum(field.options, {
            required_error: `Select a ${field.name} from the dropdown`,
          });
        }
      } else if (field.type === "date") {
        validator = z
          .date({
            required_error: `Please select ${convertToCapitalized(field.name)}`
          })
          .refine((date) => date instanceof Date && !isNaN(date.getTime()), {
            message: "Invalid date",
          })
          .refine((date) => date <= new Date(), {
            message: "Birth date cannot be in the future",
          });

        if (field.required) {
          validator = validator.refine((val) => val !== undefined, {
            message: `Please select ${convertToCapitalized(field.name)}`,
          });
        }
      } else {
        validator = z.string();

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
      }

      shape[field.name] = validator;
    });

    console.log("Generated shape:", shape);

    let schema = z.object(shape);

    if (shape["password"] && shape["confirmPassword"]) {
      return schema
        .refine(
          (data) => data.password === data.confirmPassword,
          {
            message: "Passwords must match",
            path: ["confirmPassword"],
          }
        );
    }

    return schema;
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

      const { mode: responseMode, steps: newSteps, components: newComponents } = await response.json();

      setSteps(newSteps);
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
    trigger,
    control,
    setValue,
    watch,
    reset,
    formState: {
      errors,
      isSubmitting
    },
  } = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    mode: "onBlur",
  });

  const onSubmit = async (data: any) => {
    try {
      console.log("Form Data:", data);

      const response = await fetch("http://localhost:4000/api/dashboard/save-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save data");
      }

      const result = await response.json();
      console.log("Server Response:", result);

      reset();
      setCurrentStep(0);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const renderStep = (currentStep: number) => {
    if (!steps || steps.length === 0 || !components || components.length === 0) {
      return null;
    }

    const step = steps[currentStep];

    if (!step) {
      return null;
    }

    return (
      <div>
        <h3 className="text-md font-semibold mb-2">{step.name}</h3>
        {step.fields.map((fieldName) => {
          const field = components.find((component) => component.name === fieldName);

          if (!field) return null;

          return (
            <div key={field.name} className="mb-3">
              {componentMap[field.type]
                ? componentMap[field.type](field, register, errors, control, watch, setValue)
                : componentMap["text"](field, register, errors, control, watch, setValue)}
            </div>
          );
        })}
        <div className="flex justify-between mt-4">
          {currentStep > 0 && (
            <Button type="button" variant="secondary" size="md" onClick={() => setCurrentStep((prev) => prev - 1)}>
              Previous
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button type="button" variant="primary" size="md"
              onClick={async () => {
                const step = steps[currentStep];

                if (!step) return;

                const isValid = await trigger(step.fields, { shouldFocus: true });

                if (isValid) {
                  setCurrentStep((prev) => prev + 1);
                }
              }}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    );
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
          <>
            <h2 className="text-lg font-medium mb-4">
              Your generated Form
            </h2>
            {components.length > 1 && steps && (
              <FormProgressBar
                steps={steps.map(s => ({ id: s.id, name: s.name }))}
                currentStep={currentStep}
              />
            )}
            {components && steps && (
              <form onSubmit={handleSubmit(onSubmit)} className="mt-4 p-4 border rounded bg-gray-50">
                {renderStep(currentStep)}

                {currentStep === steps.length - 1 && (
                  <Button type="submit" variant="primary" size="md" className="mt-4">
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                )}
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FormGeneratorPage;
