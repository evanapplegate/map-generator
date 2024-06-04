import geopandas as gpd
import matplotlib.pyplot as plt
import pandas as pd

plt.rcParams['pdf.fonttype'] = 42
plt.rcParams['ps.fonttype'] = 42
plt.rcParams['font.family'] = 'Arial'

countries = gpd.read_file('map_data/countries.geojson')
bounds = gpd.read_file('map_data/country_bounds.geojson')
gdp_data = pd.read_excel('uploads/world_gdp.xlsx')

countries = countries.merge(gdp_data, on='NAME', how='left')

cmap = plt.cm.Reds
norm = plt.Normalize(vmin=countries['gdp_per_capita'].min(), vmax=countries['gdp_per_capita'].max())
colors = countries['gdp_per_capita'].apply(lambda x: cmap(norm(x)) if pd.notnull(x) else '#eeeeee')

fig, ax = plt.subplots(1, 1, figsize=(15, 8))
ax.axis('off')

countries.to_crs(epsg=54030).plot(ax=ax, color=colors, edgecolor='white', linewidth=0.5)
bounds.to_crs(epsg=54030).plot(ax=ax, color='white', linewidth=0.5)

sm = plt.cm.ScalarMappable(cmap=cmap, norm=norm)
sm.set_array([])

cbar = fig.colorbar(sm, ax=ax)
cbar.set_label('GDP per Capita')

plt.savefig('map_output.pdf', format='pdf', bbox_inches='tight')
plt.savefig('map_output.png', format='png', bbox_inches='tight')