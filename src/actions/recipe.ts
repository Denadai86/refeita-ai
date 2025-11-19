// Refeita.AI/src/actions/recipe.ts
'use server';

// 🛑 CORREÇÃO 1: Importa a função correta do novo gemini.ts
import { getRecipeGenerator } from '@/utils/gemini';
import { getAdminDb } from '@/utils/firebase-admin'; 
import { RecipeActionState, RecipeFormInput, RecipeDetail, GeneratedRecipe } from '@/types/recipe';
import { FieldValue } from 'firebase-admin/firestore';
import { ZodError, z } from 'zod'; 

// --------------------------------------------------------------------
// SCHEMA DE VALIDAÇÃO (ZOD)
// --------------------------------------------------------------------
const RecipeInputSchema = z.object({
    mainIngredients: z.string().min(3, "Liste pelo menos um ingrediente principal."),
    restrictions: z.string().default("Nenhuma"),
    // 🛑 CORREÇÃO 2: Ajuste de string para ser exatamente igual ao esperado no log
    prepTimePreference: z.enum([
        'SuperRápido(até 15min)', // Removido o espaço
        'Rápido (até 30min)', 
        'Normal (30-60min)', 
        'Qualquer'
    ]).default('Qualquer'),
    cuisinePreference: z.string().default("Qualquer"),
    numberOfRecipes: z.number().int().min(1, "O número de receitas deve ser no mínimo 1.").max(5, "O número máximo de receitas é 5.").default(3),
});

// A instrução de sistema SYSTEM_INSTRUCTION_BASE foi removida daqui, 
// pois ela agora reside APENAS no utils/gemini.ts

/**
 * Server Action: Gera e salva uma lista de receitas com base nos ingredientes do usuário.
 */
export async function generateRecipe(prevState: RecipeActionState, formData: FormData): Promise<RecipeActionState> {
    
    // 1. Extração e Validação dos Dados
    let inputData: RecipeFormInput;
    try {
        const numRecipesString = formData.get('numberOfRecipes') as string;

        inputData = RecipeInputSchema.parse({
            mainIngredients: formData.get('mainIngredients'),
            restrictions: formData.get('restrictions'),
            prepTimePreference: formData.get('prepTimePreference'),
            cuisinePreference: formData.get('cuisinePreference'),
            // O Zod valida se o resultado for NaN (falha de parseInt) ou um número válido.
            numberOfRecipes: parseInt(numRecipesString) || undefined, 
        });
    } catch (error) {
        console.error("Erro de Validação/Extração de Dados:", error); 

        if (error instanceof ZodError) {
            const firstErrorMessage = (error.errors && error.errors.length > 0)
                ? error.errors[0]?.message 
                : "Erro de validação desconhecido. Por favor, verifique todos os campos.";
            
            return { success: false, message: `Erro no formulário: ${firstErrorMessage}` };
        }
        
        return { success: false, message: "Erro desconhecido no processamento da entrada. Verifique o console do servidor." };
    }
    
    const userId = null; // Usuário Anônimo

    // 2. Montagem do Prompt de Usuário
    const userPrompt = `
        Ingredientes Principais Disponíveis: ${inputData.mainIngredients}.
        Outras Restrições/Preferências: ${inputData.restrictions}.
        Tempo de Preparo Máximo: ${inputData.prepTimePreference}.
        Culinária Preferida: ${inputData.cuisinePreference}.
        Gere ${inputData.numberOfRecipes} receitas.
    `;
    
    // 3. Chamada à API Gemini com JSON Output
    try {
        const recipeGenerator = getRecipeGenerator(); // Obtém o modelo configurado

        // Define o schema de saída esperado pelo Gemini
        const recipeSchema = {
            type: "array",
            items: {
                type: "object",
                properties: {
                    recipeName: { type: "string" },
                    description: { type: "string" },
                    prepTime: { type: "string" },
                    servings: { type: "number" },
                    ingredients: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                quantity: { type: "string" }
                            },
                            required: ["name", "quantity"]
                        }
                    },
                    instructions: { type: "array", items: { type: "string" } },
                    tips: { type: "array", items: { type: "string" } }
                },
                required: ["recipeName", "description", "prepTime", "servings", "ingredients", "instructions"]
            }
        };

        // 🛑 CORREÇÃO 3: Chamada simplificada, usando o modelo que já está configurado
        const result = await recipeGenerator.generateContent({
            contents: userPrompt, 
            config: {
                responseMimeType: "application/json",
                responseSchema: recipeSchema,
                temperature: 0.8
            }
        });

        // 4. Parse e Validação do Resultado JSON
        const rawJson = result.text.trim();
        // Adiciona uma limpeza para remover o bloco de código Markdown ('```json ... ```')
        const cleanedJson = rawJson.replace(/^```json\s*|(?:\r?\n)```\s*$/g, '').replace(/^```\s*|(?:\r?\n)```\s*$/g, '').trim();

        const generatedRecipes: RecipeDetail[] = JSON.parse(cleanedJson);

        // 5. Persistência no Firestore
        const adminDb = await getAdminDb(); 

        if (!adminDb) {
            throw new Error("Conexão com Firestore Admin falhou. (Verifique as chaves Firebase)");
        }
            
        const newRecipeBatch: Omit<GeneratedRecipe, 'id'> = {
            userId,
            inputData,
            generatedRecipes,
            createdAt: FieldValue.serverTimestamp() as any,
        };

        const docRef = await adminDb.collection('recipeBatches').add(newRecipeBatch); 
        
        // 6. Retorno de Sucesso
        return {
            success: true,
            message: `Batch de receitas gerado e salvo! ID: ${docRef.id}`,
            recipeBatchId: docRef.id,
        };

    } catch (error) {
        console.error("Erro fatal na Server Action:", error);
        return { 
            success: false, 
            message: `Erro interno do servidor: Falha na geração da receita ou no parse do JSON. ${(error as Error).message}` 
        };
    }
}