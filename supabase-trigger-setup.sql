-- ============================================
-- TRIGGER PARA INSERTAR DATOS AUTOMÁTICAMENTE
-- ============================================
-- Este trigger se ejecuta automáticamente cuando se crea un usuario
-- en auth.users y inserta los datos en user_roles y customers
-- 
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard → SQL Editor
-- 2. Pega este código completo
-- 3. Ejecuta el script
-- ============================================

-- Función que se ejecutará cuando se cree un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar el rol por defecto 'customer'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  -- Insertar los datos del cliente usando metadata del registro
  -- La metadata se pasa desde el código en auth.ts durante signUp
  INSERT INTO public.customers (user_id, full_name, email, font)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    COALESCE(NEW.email, ''),
    'default'
  )
  ON CONFLICT (user_id) DO NOTHING; -- Evita duplicados si se ejecuta dos veces
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear el trigger que se ejecuta después de insertar en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- NOTAS IMPORTANTES:
-- ============================================
-- 1. Este trigger usa SECURITY DEFINER, lo que significa que se ejecuta
--    con los privilegios del usuario que creó la función, no del usuario
--    que la invoca. Esto permite insertar datos incluso si el usuario
--    no está autenticado aún.
--
-- 2. Si prefieres pasar full_name y email durante el registro, puedes
--    modificar el signUp en auth.ts para incluir metadata:
--    
--    await supabase.auth.signUp({
--      email,
--      password,
--      options: {
--        data: {
--          full_name: fullName,
--        }
--      }
--    });
--
-- 3. Después de crear este trigger, puedes eliminar las inserciones
--    manuales en auth.ts (pasos 3 y 4 del signUp) ya que el trigger
--    lo hará automáticamente.
-- ============================================
