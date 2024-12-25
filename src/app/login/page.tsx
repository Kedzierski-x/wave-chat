"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react"; // Spinner icon from Lucide React
import Link from "next/link";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email jest wymagany")
    .regex(
      /^[^\s@]+@[^\s@]+$/,
      "Niepoprawny format emaila. Użyj formatu np. user@domain"
    ),
  password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (res.ok) {
        localStorage.setItem("token", responseData.token);
        router.push("/chat");
      } else {
        form.setError("email", {
          message: responseData.error || "Błąd logowania",
        });
      }
    } catch (err) {
      console.error(err);
      form.setError("email", { message: "Wystąpił błąd. Spróbuj ponownie." });
    }
  };

  return (
    <div
      className="h-screen flex bg-cover bg-center"
      style={{
        backgroundImage: "url('/bg.png')",
      }}
    >
      {/* Lewa sekcja */}
      <div className="w-full md:w-1/3 flex flex-col justify-center items-center bg-gray-900/20 backdrop-blur-sm px-8 py-12 h-full md:h-auto">
        <div className="w-full max-w-sm text-gray-200 !mt-[-15%] md:mt-0 flex flex-col justify-center items-center md:items-start md:text-left">
          <img src="logotyp.svg" className="w-96 mb-8 mx-auto md:mx-0" />
          <h1 className="text-3xl font-bold mb-4 text-purple-500">
            Zaloguj się
          </h1>
          <p className="mb-8 text-gray-500">
            Połącz się z bliskimi dzięki Wave Chat
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-gray-300">
                      Adres Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className={`bg-gray-900/10 text-white rounded-full px-6 py-5 w-72 shadow-md focus:ring focus:ring-purple-700 ${
                          form.formState.errors.email
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-600"
                        }`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-gray-300">
                      Hasło
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className={`bg-gray-900/10 text-white rounded-full px-6 py-5 w-72 shadow-md focus:ring focus:ring-purple-700 ${
                          form.formState.errors.password
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-600"
                        }`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-72 bg-purple-700 hover:bg-purple-800 rounded-full px-6 py-5 text-lg shadow-md flex items-center justify-center"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="animate-spin text-white" size={24} />
                ) : (
                  "Zaloguj się"
                )}
              </Button>
            </form>
          </Form>
          <p className="text-gray-400 text-md mt-4 font-bold ">
            Nie masz konta?{" "}
            <Link href="/register">
              <span className="text-purple-500 hover:text-purple-400">
                Zarejestruj się
              </span>
            </Link>
          </p>

          <p className="text-gray-500 text-sm mt-4 font-light">
            ©2024 Wave Chat. Wszystkie prawa zastrzeżone.
          </p>
        </div>
      </div>

      {/* Prawa sekcja */}
      <div className="hidden md:block w-2/3"></div>
    </div>
  );
};

export default Login;
