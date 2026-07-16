-- Demo bio expansions + Romina Pigeonette theme (non-destructive UPDATEs).

UPDATE profiles SET description = '<p>Desde México, hago letras con amor y buen sazón. Tipografía a la medida, lettering e ingeniería en Tortilla.studio.</p><h2>Tipografía con raíz</h2><p>Trabajo con estudios, marcas y editoriales que buscan una voz tipográfica clara y con raíz mexicana — desde logotipos hasta familias completas para texto corrido, UI y packaging.</p><p>Me importa el oficio: boceto, revisión, kerning, pruebas en contexto real. Cada proyecto empieza con escucha y termina con archivos listos para producción.</p><h2>Colaboración</h2><p>Talleres, charlas y colaboraciones con el Colegio de Diseñadores, TMX y equipos creativos en CDMX y remoto. Si tienes un proyecto — editorial, marca o fuente propia — escríbeme.</p>',
  custom_css = '.profile-card .bio-lead,
.profile-detail .profile-bio > p:first-child {
  font-family: ''Pigeonette'', sans-serif;
  font-size: 1.35rem;
  line-height: 1.35;
}
.profile-detail .profile-bio {
  font-family: ''Pigeonette'', sans-serif;
  font-size: 1.125rem;
  line-height: 1.6;
}
.profile-detail .profile-bio h2 {
  font-family: ''Pigeonette'', sans-serif;
  font-size: 1.5rem;
}
.profile-detail h1 {
  font-family: ''Pigeonette'', sans-serif;
  letter-spacing: 0.02em;
}',
  custom_fonts = '[{"id":"pigeonette","family":"Pigeonette","url":"/media/profiles/user_romina/font/pigeonette.woff2","format":"woff2"}]'
WHERE slug = 'romina-hernandez';

UPDATE profiles SET description = '<p>Diseñador tipográfico y editorial. Fuentes para prensa, libros e identidad cultural mexicana.</p><h2>Editorial y prensa</h2><p>He diseñado tipos para periódicos, museos y sellos independientes. Me interesa la legibilidad, el detalle y la historia detrás de cada letra — cómo una familia tipográfica sostiene un tono editorial durante años.</p><p>Desde revistas culturales hasta catálogos de museo, busco sistemas que funcionen en titulares y en notas al pie con la misma voz.</p>'
WHERE slug = 'cristobal-henestrosa';

UPDATE profiles SET description = '<p>Lettering, caligrafía y tipografía para marcas. Proyectos de identidad con trazo propio.</p><h2>Marcas con carácter</h2><p>Desde Puebla trabajo con restaurantes, cervecerías y proyectos culturales que necesitan letras con carácter — mural, empaque o sistema completo.</p><p>El proceso mezcla boceto a mano, refinamiento digital y entrega lista para impresión o pantalla. Me gusta cuando la tipografía se siente hecha para ese negocio, no sacada de un catálogo.</p><p>Disponible para colaboraciones en México y remoto.</p>'
WHERE slug = 'miguel-contreras';

UPDATE profiles SET description = '<p>Mexican type designer &amp; calligrapher. Fuentes y caligrafía para editorial e identidad.</p><h2>Caligrafía y fuentes</h2><p>Vivo entre proyectos editoriales y encargos de caligrafía para invitaciones, libros de artista y piezas de colección.</p><p>Investigo la relación entre trazo manual y sistemas tipográficos digitales — a veces la caligrafía guía una familia completa; otras, la fuente nace directo del lápiz.</p>'
WHERE slug = 'cecilia-del-castillo';

UPDATE profiles SET description = '<p>Identidad tipográfica, lettering y caligrafía para marcas culturales y editoriales.</p><h2>Sistema y voz</h2><p>Combino investigación, boceto y sistema para que la voz de una marca se sienta coherente en impreso y pantalla.</p><p>Proyectos recientes: festivales, sellos discográficos y identidad para espacios culturales en CDMX.</p><p>Trabajo en paquetes que incluyen logotipo, lettering, selección tipográfica y guías de uso para equipos internos.</p>'
WHERE slug = 'mara-osman';
