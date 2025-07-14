fetch('data.json')
  .then(res => res.json())
  .then(data => {
    const nodes = data.courses.map(c => ({ id: c.id, name: c.name }));
    const links = data.courses.flatMap(c =>
      c.prereqs.map(pr => ({ source: pr, target: c.id }))
    );

    const width = window.innerWidth;
    const height = window.innerHeight * 0.85;

    const svg = d3.select("#vis")
      .attr("width", width)
      .attr("height", height);

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "link");

    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("circle")
      .attr("r", 20);

    node.append("text")
      .attr("dy", 4)
      .attr("x", 25)
      .text(d => d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  })
  .catch(err => {
    console.error('Error cargando data.json:', err);
  });
